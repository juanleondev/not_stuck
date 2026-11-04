# Resume LaTeX

ATS-friendly resume in LaTeX format.

## Compilation

Simply run:

```bash
make compile
```

Or just:

```bash
make
```

This will compile `resume.tex` into `resume.pdf`.

## Other Commands

- `make publish` - Compile and copy the PDF to `apps/web/public/cv.pdf`, served at `/cv.pdf`
- `make clean` - Remove auxiliary LaTeX files (`.aux`, `.log`, etc.)
- `make help` - Show available commands

## Features

- **ATS-friendly**: Simple, linear layout optimized for Applicant Tracking Systems
- **Standard formatting**: Uses only basic LaTeX packages (no external dependencies)
- **Clean structure**: Easy to read and modify

## File Structure

- `resume.tex` - Main LaTeX source file
- `resume.pdf` - Compiled PDF output (not tracked; the published copy lives in `apps/web/public/cv.pdf`)
- `Makefile` - Build automation

The repository is public, so the resume only lists GitHub and LinkedIn as contact details.
