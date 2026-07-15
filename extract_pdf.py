import fitz
import os

pdf_path = None
for f in os.listdir(r'C:\script\NEURO'):
    if f.endswith('.pdf'):
        pdf_path = os.path.join(r'C:\script\NEURO', f)
        break

if not pdf_path:
    print("No PDF found")
    exit()

doc = fitz.open(pdf_path)
print(f"File: {pdf_path}")
print(f"Pages: {len(doc)}")

for i, page in enumerate(doc):
    text = page.get_text()
    print(f"\n--- Page {i+1} ---")
    print(f"Text ({len(text)} chars):")
    print(repr(text[:2000]))
    
    images = page.get_images()
    print(f"Images: {len(images)}")
    
    # Extract image info
    for j, img in enumerate(images):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        print(f"  Image {j}: {pix.width}x{pix.height}, colorspace={pix.n}")

# Also try to extract text from images (OCR would be needed)
# Let's at least save images
for i, page in enumerate(doc):
    images = page.get_images()
    for j, img in enumerate(images):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        if pix.n - pix.alpha < 4:  # RGB or Grayscale
            out_path = os.path.join(r'C:\script\NEURO', f'pdf_img_p{i+1}_{j}.png')
            pix.save(out_path)
            print(f"Saved: {out_path}")
        else:
            pix2 = fitz.Pixmap(fitz.csRGB, pix)
            out_path = os.path.join(r'C:\script\NEURO', f'pdf_img_p{i+1}_{j}.png')
            pix2.save(out_path)
            print(f"Saved: {out_path}")
            pix2 = None
        pix = None

doc.close()
