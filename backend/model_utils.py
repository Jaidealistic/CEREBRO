
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from captum.attr import LayerIntegratedGradients, TokenReferenceBase, visualization
import numpy as np
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(model_path):
    """Loads the model and tokenizer from the specified path using AutoClasses."""
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForSequenceClassification.from_pretrained(model_path)
        model.to(device)
        model.eval()
        return model, tokenizer
    except Exception as e:
        print(f"Error loading model from {model_path}: {e}")
        return None, None

def predict(text, model, tokenizer):
    """
    Predicts the class (spam/ham or phishing/safe) and returns formatting for visualization.
    """
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512).to(device)
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)
        pred_label_idx = torch.argmax(probs, dim=1).item()
        confidence = probs[0][pred_label_idx].item()

    return pred_label_idx, confidence, inputs

def explain_prediction(text, model, tokenizer, target_class=None):
    """
    Computes attributions using Integrated Gradients.
    Returns list of (word, attribution_score) tuples.
    """
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    input_ids = inputs["input_ids"].to(device)
    token_type_ids = inputs["token_type_ids"].to(device) if "token_type_ids" in inputs else None
    attention_mask = inputs["attention_mask"].to(device)
    
    # Forward function for Captum
    def forward_func(inputs, token_type_ids=None, attention_mask=None):
        if token_type_ids is not None:
             pred = model(inputs, token_type_ids=token_type_ids, attention_mask=attention_mask)
        else:
             pred = model(inputs, attention_mask=attention_mask)
        return pred.logits

    # Construct LayerIntegratedGradients
    # Handle different model architectures for embeddings
    if hasattr(model, 'bert'):
        embeddings = model.bert.embeddings
    elif hasattr(model, 'distilbert'):
        embeddings = model.distilbert.embeddings
    elif hasattr(model, 'roberta'):
         embeddings = model.roberta.embeddings
    else:
        # Fallback or error
        print("Warning: Could not identify embedding layer. Explanations might fail.")
        embeddings = model.base_model.embeddings

    lig = LayerIntegratedGradients(forward_func, embeddings)

    if target_class is None:
        # Default to predicted class
        with torch.no_grad():
            if token_type_ids is not None:
                outputs = model(input_ids, token_type_ids=token_type_ids, attention_mask=attention_mask)
            else:
                outputs = model(input_ids, attention_mask=attention_mask)
            target_class = torch.argmax(outputs.logits, dim=1).item()

    # Compute attributions
    attributions, delta = lig.attribute(
        inputs=input_ids,
        baselines=None,
        target=target_class,
        additional_forward_args=(token_type_ids, attention_mask),
        return_convergence_delta=True
    )
    
    attributions = attributions.sum(dim=2).squeeze(0)
    attributions = attributions / torch.norm(attributions)
    attributions = attributions.cpu().detach().numpy()
    
    # decode tokens
    tokens = tokenizer.convert_ids_to_tokens(input_ids[0])
    
    # Filter out special tokens ([CLS], [SEP], [PAD]) for cleaner visualization
    result = []
    for token, attr in zip(tokens, attributions):
        if token not in ['[CLS]', '[SEP]', '[PAD]']:
            result.append((token, float(attr)))
            
    return result, target_class

