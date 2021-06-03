all: report

report: process_book.md
	pandoc process_book.md -o process_book.pdf --highlight-style=monochrome -V 'fontsize: 12pt' -V 'papersize: A4' -V 'urlcolor: blue' -V 'date: \today{}' -V 'documentclass:article' -V 'geometry:margin=2.5cm'
