import fitz
import os

pdf_path = None
for f in os.listdir(r'C:\script\NEURO'):
    if f.endswith('.pdf') and 'визитк' in f.lower():
        pdf_path = os.path.join(r'C:\script\NEURO', f)
        break

if not pdf_path:
    for f in os.listdir(r'C:\script\NEURO'):
        if f.endswith('.pdf'):
            pdf_path = os.path.join(r'C:\script\NEURO', f)
            break

doc = fitz.open(pdf_path)
print(f"Pages: {len(doc)}")

for i, page in enumerate(doc):
    # Render at high DPI
    mat = fitz.Matrix(3, 3)  # 3x zoom = ~216 DPI
    pix = page.get_pixmap(matrix=mat)
    out_path = os.path.join(r'C:\script\NEURO', f'pdf_page_{i+1}.png')
    pix.save(out_path)
    print(f"Page {i+1} saved: {out_path} ({pix.width}x{pix.height})")

doc.close()
