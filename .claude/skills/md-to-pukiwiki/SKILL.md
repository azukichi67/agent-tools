---
name: md-to-pukiwiki
description: Convert Markdown files (including MDX with frontmatter) to PukiWiki format. Use this skill when the user wants to convert Markdown content to PukiWiki wiki syntax, mentions "PukiWiki", requests format conversion from Markdown, or references .md or .mdx files in the context of wiki migration or PukiWiki publishing. Triggers include phrases like "convert to PukiWiki", "PukiWiki format", "markdown to wiki", "migrate to PukiWiki", or any request involving PukiWiki wiki syntax conversion.
---

# Markdown to PukiWiki Converter

## Overview

This skill converts Markdown files (including MDX with YAML frontmatter) to PukiWiki wiki format. It handles common Markdown syntax elements like headings, lists, code blocks, tables, links, images, and inline formatting, converting them to their PukiWiki equivalents.

## Quick Start

To convert a Markdown file to PukiWiki format:

```bash
python3 scripts/md_to_pukiwiki.py <input-file.md>
```

The converted content will be printed to standard output. You can then copy and paste it into your PukiWiki page.

**Example:**

```bash
python3 scripts/md_to_pukiwiki.py blog-post.mdx
```

## What Gets Converted

### Frontmatter

YAML frontmatter (commonly used in blog posts and MDX files) is converted to PukiWiki comments:

**Markdown:**
```yaml
---
title: My Post
date: 2024-01-01
tags: [dev, blog]
---
```

**PukiWiki:**
```
// title: My Post
// date: 2024-01-01
// tags: [dev, blog]
```

### Headings

**Markdown:**
```markdown
# Heading 1
## Heading 2
### Heading 3
```

**PukiWiki:**
```
* Heading 1
** Heading 2
*** Heading 3
```

### Lists

**Unordered lists:**
```markdown
- Item 1
  - Nested item
- Item 2
```

→

```
- Item 1
-- Nested item
- Item 2
```

**Ordered lists:**
```markdown
1. First
2. Second
   1. Nested
```

→

```
+ First
+ Second
++ Nested
```

### Code Blocks

**Markdown:**
````markdown
```python
def hello():
    print("Hello")
```
````

**PukiWiki:**
```
 def hello():
     print("Hello")
```

(Code blocks are indented with a leading space)

### Inline Formatting

| Markdown | PukiWiki | Description |
|----------|----------|-------------|
| `**bold**` | `''bold''` | Strong emphasis |
| `*italic*` | `'''italic'''` | Emphasis/italic |
| `~~strike~~` | `%%strike%%` | Strikethrough |
| `` `code` `` | `` `code` `` | Inline code (unchanged) |

### Links and Images

**Links:**
- `[text](https://example.com)` → `[[text:https://example.com]]`
- `[text](page-name)` → `[[text>page-name]]`

**Images:**
- `![alt text](image.png)` → `#ref(image.png,nolink,alt text)`
- `![](image.png)` → `#ref(image.png)`

### Tables

**Markdown:**
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Data 1   | Data 2   |
```

**PukiWiki:**
```
|~Header 1|~Header 2|h
|Data 1|Data 2|
```

### Blockquotes

**Markdown:**
```markdown
> Quote level 1
>> Quote level 2
```

**PukiWiki:**
```
> Quote level 1
>> Quote level 2
```

### Horizontal Rules

**Markdown:**
```markdown
---
```

**PukiWiki:**
```
----
```

## Advanced Conversion Details

### Line Breaks

- **Trailing spaces** (two spaces at end of line in Markdown) → `~` in PukiWiki
- Explicit `<br>` tags can be converted to `&br;` if needed (currently preserved as-is)

### Nesting Limits

PukiWiki has a maximum nesting depth of 3 levels for:
- Lists (`-`, `--`, `---`)
- Blockquotes (`>`, `>>`, `>>>`)
- Definition lists (`:`, `::`, `:::`)

The converter respects these limits and caps nesting at 3 levels.

### Special Characters

PukiWiki treats certain characters at the beginning of lines specially (`~`, `-`, `+`, `:`, `>`, `|`, `#`, `//`). If you need these as literal characters, prefix the line with `~` in PukiWiki.

## Typical Workflows

### Converting a Blog Post

When converting blog posts (typically MDX files with frontmatter):

1. Run the converter on your MDX file:
   ```bash
   python3 scripts/md_to_pukiwiki.py app/posts/202501/my-post.mdx
   ```

2. Review the output, especially:
   - Frontmatter conversion (now as comments)
   - Code block formatting
   - Table structure

3. Copy the output and paste into your PukiWiki page editor

### Converting Multiple Files

To convert multiple files, use a simple loop:

```bash
for file in posts/*.md; do
  echo "Converting $file..."
  python3 scripts/md_to_pukiwiki.py "$file" > "converted/$(basename "$file" .md).txt"
done
```

### Testing Conversion

For testing, you can compare a small section:

```bash
# Convert and view first 50 lines
python3 scripts/md_to_pukiwiki.py input.md | head -50
```

## Resources

### scripts/md_to_pukiwiki.py

The main conversion script. It:
- Reads Markdown/MDX files
- Extracts and converts YAML frontmatter
- Processes block elements (headings, lists, code blocks, tables)
- Converts inline elements (links, formatting, images)
- Outputs to stdout or specified file

**Usage:**
```bash
python3 scripts/md_to_pukiwiki.py <input-file> [-o <output-file>]
```

**Options:**
- `input_file` (required): Path to Markdown/MDX file
- `-o, --output` (optional): Output file path (default: stdout)

### references/pukiwiki-syntax.md

Comprehensive reference document detailing PukiWiki formatting rules, including:
- Block elements (paragraphs, headings, lists, tables, code blocks)
- Inline elements (links, formatting, images)
- Conversion mapping from Markdown to PukiWiki
- Special cases and limitations

**When to read this file:**
- When you need detailed PukiWiki syntax information
- When troubleshooting conversion issues
- When the user asks about specific PukiWiki formatting rules
- When implementing custom conversion logic

## Common Issues

### Code Block Language Identifiers

Markdown code blocks often specify a language:
````markdown
```python
code
```
````

PukiWiki doesn't support language-specific syntax highlighting in basic formatting. The language identifier is ignored during conversion. If syntax highlighting is required, consider using PukiWiki plugins (not covered by this converter).

### Complex Tables

The converter handles basic Markdown tables with headers and data rows. Complex features like:
- Cell alignment (left/center/right)
- Cell merging (colspan/rowspan)
- Cell background colors

...are not automatically converted. You may need to manually add PukiWiki table formatting directives after conversion.

### Nested Markdown

PukiWiki has strict nesting limits (3 levels). If your Markdown has deeper nesting, the converter will cap it at 3 levels. Review deeply nested lists or blockquotes after conversion.
