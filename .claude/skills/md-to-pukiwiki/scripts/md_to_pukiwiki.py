#!/usr/bin/env python3
"""
Markdown to PukiWiki Converter

Converts Markdown (including MDX with frontmatter) to PukiWiki format.
"""

import sys
import re
import argparse
from pathlib import Path
from typing import List, Tuple, Optional


class MarkdownToPukiWikiConverter:
    """Converts Markdown content to PukiWiki format."""

    def __init__(self):
        self.in_code_block = False
        self.in_table = False
        self.table_separator_seen = False

    def convert(self, content: str) -> str:
        """Convert Markdown content to PukiWiki format."""
        lines = content.split('\n')
        result = []

        # Process frontmatter
        lines, frontmatter = self._extract_frontmatter(lines)
        if frontmatter:
            result.extend(self._convert_frontmatter(frontmatter))
            result.append('')  # Add blank line after frontmatter

        # Process content
        i = 0
        while i < len(lines):
            line = lines[i]

            # Handle code blocks
            if line.strip().startswith('```'):
                code_lines, i = self._process_code_block(lines, i)
                result.extend(code_lines)
                continue

            # Handle tables
            if self._is_table_line(line):
                table_lines, i = self._process_table(lines, i)
                result.extend(table_lines)
                continue

            # Convert regular line
            converted = self._convert_line(line)
            result.append(converted)
            i += 1

        return '\n'.join(result)

    def _extract_frontmatter(self, lines: List[str]) -> Tuple[List[str], Optional[dict]]:
        """Extract YAML frontmatter if present."""
        if not lines or lines[0].strip() != '---':
            return lines, None

        # Find closing ---
        end_idx = -1
        for i in range(1, len(lines)):
            if lines[i].strip() == '---':
                end_idx = i
                break

        if end_idx == -1:
            return lines, None

        # Parse frontmatter
        frontmatter = {}
        for line in lines[1:end_idx]:
            if ':' in line:
                key, value = line.split(':', 1)
                frontmatter[key.strip()] = value.strip()

        # Return remaining lines
        return lines[end_idx + 1:], frontmatter

    def _convert_frontmatter(self, frontmatter: dict) -> List[str]:
        """Convert frontmatter to PukiWiki comments or definition list."""
        result = []

        # Add as comments
        for key, value in frontmatter.items():
            result.append(f'// {key}: {value}')

        return result

    def _process_code_block(self, lines: List[str], start: int) -> Tuple[List[str], int]:
        """Process a code block and convert to PukiWiki format."""
        result = []
        i = start + 1

        # Skip language identifier
        # In PukiWiki, code blocks are just indented with a space

        while i < len(lines):
            line = lines[i]
            if line.strip().startswith('```'):
                i += 1
                break
            # Add leading space for PukiWiki code block
            result.append(' ' + line)
            i += 1

        return result, i

    def _is_table_line(self, line: str) -> bool:
        """Check if line is a Markdown table line."""
        return line.strip().startswith('|') and line.strip().endswith('|')

    def _process_table(self, lines: List[str], start: int) -> Tuple[List[str], int]:
        """Process a Markdown table and convert to PukiWiki format."""
        result = []
        i = start
        is_first_row = True

        while i < len(lines):
            line = lines[i].strip()

            if not self._is_table_line(line):
                break

            # Check if this is a separator line
            if re.match(r'^\|[\s\-:|]+\|$', line):
                # Skip separator line
                i += 1
                continue

            # Convert table row
            cells = [cell.strip() for cell in line.split('|')[1:-1]]

            if is_first_row:
                # Header row
                pukiwiki_cells = ['~' + self._convert_inline(cell) for cell in cells]
                result.append('|' + '|'.join(pukiwiki_cells) + '|h')
                is_first_row = False
            else:
                # Data row
                pukiwiki_cells = [self._convert_inline(cell) for cell in cells]
                result.append('|' + '|'.join(pukiwiki_cells) + '|')

            i += 1

        return result, i

    def _convert_line(self, line: str) -> str:
        """Convert a single line to PukiWiki format."""
        stripped = line.lstrip()
        indent = len(line) - len(stripped)

        # Empty line
        if not stripped:
            return line

        # Comments
        if stripped.startswith('//'):
            return line

        # Headings
        if stripped.startswith('#'):
            return self._convert_heading(stripped)

        # Horizontal rule
        if re.match(r'^[-*_]{3,}$', stripped):
            return '----'

        # Lists
        if stripped.startswith('- ') or stripped.startswith('* '):
            return self._convert_unordered_list(line, indent)

        if re.match(r'^\d+\.\s', stripped):
            return self._convert_ordered_list(line, indent)

        # Blockquote
        if stripped.startswith('>'):
            return self._convert_blockquote(stripped)

        # Regular paragraph
        return self._convert_inline(line)

    def _convert_heading(self, line: str) -> str:
        """Convert Markdown heading to PukiWiki heading."""
        match = re.match(r'^(#{1,3})\s+(.+)$', line.strip())
        if not match:
            return line

        level = len(match.group(1))
        text = match.group(2)

        # Remove trailing #
        text = re.sub(r'\s*#+\s*$', '', text)

        return '*' * level + ' ' + self._convert_inline(text)

    def _convert_unordered_list(self, line: str, base_indent: int) -> str:
        """Convert unordered list item to PukiWiki format."""
        # Calculate nesting level from indentation
        indent_level = base_indent // 2

        # Remove list marker (single bullet only; keep content like leading **bold**)
        text = re.sub(r'^\s*[-*]\s+', '', line).strip()

        # PukiWiki list markers
        marker = '-' * (indent_level + 1)

        return marker + ' ' + self._convert_inline(text)

    def _convert_ordered_list(self, line: str, base_indent: int) -> str:
        """Convert ordered list item to PukiWiki format."""
        # Calculate nesting level from indentation
        indent_level = base_indent // 2

        # Remove list marker
        text = re.sub(r'^\s*\d+\.\s+', '', line)

        # PukiWiki ordered list markers
        marker = '+' * (indent_level + 1)

        return marker + ' ' + self._convert_inline(text)

    def _convert_blockquote(self, line: str) -> str:
        """Convert blockquote to PukiWiki format."""
        # Count > characters for nesting level
        level = 0
        text = line
        while text.startswith('>'):
            level += 1
            text = text[1:].lstrip()

        # PukiWiki blockquote
        marker = '>' * min(level, 3)  # Max 3 levels in PukiWiki

        return marker + ' ' + self._convert_inline(text)

    def _convert_inline(self, text: str) -> str:
        """Convert inline Markdown elements to PukiWiki format."""
        # Images: ![alt](url) -> &ref(url,,70%);
        text = re.sub(
            r'!\[([^\]]*)\]\(([^)]+)\)',
            lambda m: f'&ref({m.group(2)},,70%);',
            text
        )

        # Links: [text](url) -> [[text:url]] or [[text>page]]
        def convert_link(match):
            link_text = match.group(1)
            link_url = match.group(2)

            # Check if it's a URL or a page reference
            if re.match(r'^https?://', link_url):
                return f'[[{link_text}:{link_url}]]'
            else:
                return f'[[{link_text}>{link_url}]]'

        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', convert_link, text)

        # Inline code: `code` -> ''code'' (emphasis/strong)
        text = re.sub(r'`([^`]+)`', r"''\1''", text)

        # Bold: **text** or __text__ -> ''text''
        text = re.sub(r'\*\*([^*]+)\*\*', r"''\1''", text)
        text = re.sub(r'__([^_]+)__', r"''\1''", text)

        # Italic: *text* or _text_ -> '''text'''
        # Must be after bold to avoid conflicts
        text = re.sub(r'\*([^*]+)\*', r"'''\1'''", text)
        text = re.sub(r'_([^_]+)_', r"'''\1'''", text)

        # Strikethrough: ~~text~~ -> %%text%%
        text = re.sub(r'~~([^~]+)~~', r'%%\1%%', text)

        # Line breaks: two spaces at end of line -> remove
        text = re.sub(r'  $', '', text)

        return text


def main():
    """Main entry point for the converter."""
    parser = argparse.ArgumentParser(
        description='Convert Markdown files to PukiWiki format'
    )
    parser.add_argument(
        'input_file',
        type=str,
        help='Input Markdown file path'
    )
    parser.add_argument(
        '-o', '--output',
        type=str,
        help='Output file path (default: stdout)'
    )

    args = parser.parse_args()

    # Read input file
    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f'Error: File not found: {args.input_file}', file=sys.stderr)
        sys.exit(1)

    content = input_path.read_text(encoding='utf-8')

    # Convert
    converter = MarkdownToPukiWikiConverter()
    result = converter.convert(content)

    # Output
    if args.output:
        output_path = Path(args.output)
        output_path.write_text(result, encoding='utf-8')
        print(f'Converted file saved to: {args.output}', file=sys.stderr)
    else:
        print(result)


if __name__ == '__main__':
    main()
