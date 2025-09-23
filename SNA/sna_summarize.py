import os
from pathlib import Path
from typing import List, Dict

# PDF
from io import StringIO
try:
    from pdfminer.high_level import extract_text as pdfminer_extract_text
except Exception:
    pdfminer_extract_text = None

try:
    import PyPDF2
except Exception:
    PyPDF2 = None

try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

# Excel
import pandas as pd

BASE = Path(__file__).resolve().parent

PDF_FILES = [
    BASE / "2025_SNA_Pre-edit.pdf",
    BASE / "Implementation_Strategy_UNSC_ENDORSED.pdf",
]
XLSX_FILE = BASE / "2025SNASeqAccts.xlsx"
OUTPUT_MD = BASE / "SNA_summary.md"


def read_pdf_text(pdf_path: Path, max_chars: int = 40000) -> str:
    # 1) pdfminer가 가능하면 우선 사용
    if pdfminer_extract_text is not None:
        try:
            text = pdfminer_extract_text(str(pdf_path))
            text = text.replace('\r', '\n')
            if text.strip():
                return text[:max_chars]
        except Exception:
            pass
    # 2) PyPDF2 폴백
    if PyPDF2 is not None:
        try:
            text = []
            with open(pdf_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages[:40]:
                    text.append(page.extract_text() or "")
            joined = "\n".join(text)
            if joined.strip():
                return joined[:max_chars]
        except Exception:
            pass
    # 3) PyMuPDF 폴백
    if fitz is not None:
        try:
            doc = fitz.open(str(pdf_path))
            text = []
            for i, page in enumerate(doc):
                if i >= 40:
                    break
                text.append(page.get_text())
            doc.close()
            joined = "\n".join(text)
            if joined.strip():
                return joined[:max_chars]
        except Exception as e:
            return f"[ERROR] PDF 읽기 실패(PyMuPDF): {pdf_path.name} - {e}"

    return f"[ERROR] PDF 텍스트 추출 실패: {pdf_path.name} (pdfminer/PyPDF2/PyMuPDF 모두 실패)"


def summarize_pdf(text: str, title: str) -> str:
    if text.startswith("[ERROR]"):
        return f"### {title}\n{text}\n"

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    head = lines[:80]

    keywords = [
        "objective", "objectives", "goal", "scope", "principle", "principles",
        "method", "methodology", "framework", "implementation", "strategy",
        "governance", "data", "classification", "accounts", "sequence",
        "household", "government", "production", "consumption", "capital",
        "satellite", "measurement", "timeline", "milestone"
    ]
    found = [ln for ln in lines if any(k in ln.lower() for k in keywords)][:40]

    parts = []
    parts.append(f"### {title}")
    parts.append("- 미리보기(상위 80줄 발췌):")
    parts.append("\n".join(f"> {ln}" for ln in head))
    if found:
        parts.append("\n- 키워드 기반 주요 문장 발췌:")
        parts.append("\n".join(f"  - {ln}" for ln in found))
    return "\n\n".join(parts) + "\n\n"


def summarize_excel(xlsx_path: Path) -> str:
    try:
        xls = pd.ExcelFile(xlsx_path)
        sheets = xls.sheet_names
        parts = ["### 2025SNASeqAccts.xlsx 구조 요약", "- 시트 목록:"]
        parts += [f"  - {name}" for name in sheets]

        for name in sheets[:6]:
            try:
                df = xls.parse(name)
                preview = df.iloc[:5, :10]
                parts.append(f"\n- 시트 '{name}' 상단 5행 미리보기:")
                parts.append(preview.to_markdown(index=False))
            except Exception as e:
                parts.append(f"- 시트 '{name}' 읽기 실패: {e}")

        return "\n\n".join(parts) + "\n"
    except Exception as e:
        return f"### 2025SNASeqAccts.xlsx 구조 요약\n[ERROR] 엑셀 읽기 실패: {e}\n"


def main():
    md_parts: List[str] = ["## SNA 문서/데이터 요약"]

    for pdf in PDF_FILES:
        md_parts.append(summarize_pdf(read_pdf_text(pdf), pdf.name))

    md_parts.append(summarize_excel(XLSX_FILE))

    OUTPUT_MD.write_text("\n\n".join(md_parts), encoding="utf-8")
    print(f"요약 파일 생성: {OUTPUT_MD}")


if __name__ == "__main__":
    main()
