# Makefile for compiling resume
# Usage: make compile or just: make

# LaTeX compiler
PDFLATEX ?= pdflatex

# Source file
SOURCE = resume.tex
OUTPUT = resume.pdf
WEB_PDF = ../../apps/web/public/cv.pdf

# Default target
.PHONY: all compile publish clean help

all: compile

compile: $(OUTPUT)

$(OUTPUT): $(SOURCE)
	@echo "Compiling $(SOURCE)..."
	@$(PDFLATEX) -interaction=nonstopmode $(SOURCE) > /dev/null 2>&1
	@$(PDFLATEX) -interaction=nonstopmode $(SOURCE) > /dev/null 2>&1
	@echo "✓ PDF compiled successfully: $(OUTPUT)"
	@ls -lh $(OUTPUT)

publish: $(OUTPUT)
	@cp $(OUTPUT) $(WEB_PDF)
	@echo "✓ Copied to $(WEB_PDF)"

clean:
	@echo "Cleaning auxiliary files..."
	@rm -f *.aux *.log *.out *.toc *.synctex.gz
	@echo "✓ Cleaned"

help:
	@echo "Available targets:"
	@echo "  make compile  - Compile the resume (default)"
	@echo "  make publish  - Compile and copy the PDF to the website (/cv.pdf)"
	@echo "  make clean    - Remove auxiliary files"
	@echo "  make help     - Show this help message"
