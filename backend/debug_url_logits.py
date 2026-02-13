import torch
import model_utils
import os
import torch.nn.functional as F

def debug_logits():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Fix path to point correctly to url folder
    url_model_path = os.path.join(os.path.dirname(base_dir), "url")
    
    output_file = os.path.join(base_dir, "logits.txt")
    
    with open(output_file, "w") as f:
        f.write(f"Loading model from {url_model_path}...\n")
        model, tokenizer = model_utils.load_model(url_model_path)
        if not model:
            f.write("Failed to load model.\n")
            return

        test_urls = [
            "http://google.com",
            "https://www.bnymellon.com",
            "http://suspicious-site.com/login",
            "http://paypal-verification-secure.com"
        ]

        f.write("\n--- Raw Logits Analysis ---\n")
        for url in test_urls:
            inputs = tokenizer(url, return_tensors="pt", truncation=True, padding=True, max_length=512).to(model_utils.device)
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
                probs = F.softmax(logits, dim=1)
                pred_idx = torch.argmax(probs, dim=1).item()
                
                f.write(f"URL: {url}\n")
                f.write(f"Logits: {logits.cpu().numpy()}\n")
                f.write(f"Probs: {probs.cpu().numpy()}\n")
                f.write(f"Predicted Index: {pred_idx}\n")
                f.write("-" * 20 + "\n")
    print(f"Written logits to {output_file}")

if __name__ == "__main__":
    debug_logits()
