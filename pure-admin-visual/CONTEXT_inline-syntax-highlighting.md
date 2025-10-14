# Context: Inline Syntax Highlighting for Query Language Search

## Date
2025-10-13

## Feature Request
Transform the current token-based query builder into an inline syntax-highlighted query editor.

## Current Implementation
**File**: `src/js/search-autocomplete.js`

**Current Behavior**:
- User types `:name` and selects from autocomplete
- Selected items become **separate badge tokens** (like pills/chips)
- Each query fragment (field, operator, value) is a distinct removable token
- Result: `[name][starts_with][abc]` as separate visual badges
- Tokens cannot be edited in-place, only removed

**Current Page**: `/table-filters` - "Query Language Search with Smart Autocomplete & Logic Tree Visualization"

## Desired Implementation

### Desired Behavior
User can type a **continuous query string** with **inline syntax highlighting**:

```
:name startswith abcd :price between 1 to 3
```

Visual rendering (inline, not separate tokens):
- `:name` - highlighted in blue (field)
- `startswith` - highlighted in gray (operator)
- `abcd` - highlighted in green (value)
- `:price` - highlighted in blue (field)
- `between` - highlighted in gray (operator)
- `1` and `3` - highlighted in green (values)

### Key Requirements

1. **Editable Text Input**
   - Single input field or contenteditable div
   - Cursor can move anywhere with arrow keys
   - Can select, delete, insert text at any position
   - Full text editing capabilities (cut, copy, paste)

2. **Inline Syntax Highlighting**
   - Different parts of query get background colors
   - Colors applied as inline styles or overlays
   - Highlighting updates as user types
   - Similar to code editor syntax highlighting

3. **Context-Aware Autocomplete**
   - Autocomplete triggered by `:` for fields
   - After field name + space, show operators
   - After operator + space, ready for value input
   - Autocomplete position based on cursor location
   - Parse current query to determine what suggestions to show

4. **Query Parsing**
   - Parse query string to identify:
     - Fields (`:fieldname`)
     - Operators (`startswith`, `between`, `equals`, etc.)
     - Values (everything else)
   - Update syntax highlighting based on parse results
   - Maintain parse state as user types

### Examples

**Example 1: Text Search**
```
:name startswith John :email contains @gmail.com
```
- Fields: `name`, `email` (blue background)
- Operators: `startswith`, `contains` (gray background)
- Values: `John`, `@gmail.com` (green background)

**Example 2: Numeric Range**
```
:price between 10 to 100 :quantity > 5
```
- Fields: `price`, `quantity` (blue)
- Operators: `between`, `>` (gray)
- Values: `10`, `100`, `5` (green)
- Keywords: `to` (could be orange/accent)

**Example 3: Date Filters**
```
:created after 2024-01-01 :status equals active
```

## Technical Approach Options

### Option A: Contenteditable with Overlays
```html
<div class="query-editor">
  <div class="query-editor__highlights">
    <!-- Syntax highlighting spans positioned absolutely -->
    <span class="highlight highlight--field">:name</span>
    <span class="highlight highlight--operator">startswith</span>
    <span class="highlight highlight--value">abcd</span>
  </div>
  <div class="query-editor__input" contenteditable="true">
    :name startswith abcd
  </div>
</div>
```
- Contenteditable div for input
- Separate overlay layer for highlights
- Sync scroll position between layers
- Calculate highlight positions based on text ranges

### Option B: Decorated Input with Spans
```html
<div class="query-editor" contenteditable="true">
  <span class="token token--field">:name</span>
  <span class="token token--operator">startswith</span>
  <span class="token token--value">abcd</span>
</div>
```
- Single contenteditable container
- Wrap parsed tokens in styled spans
- Maintain cursor position when re-rendering
- Handle span boundaries during editing

### Option C: Textarea with Background Canvas
- Use textarea for input (native editing)
- Render highlighted version on canvas/div behind textarea
- Make textarea transparent
- Perfect alignment needed between layers

## Implementation Challenges

1. **Cursor Position Management**
   - Track cursor position during re-renders
   - Restore cursor after applying syntax highlighting
   - Handle selection ranges

2. **Real-time Parsing**
   - Parse query on every keystroke
   - Identify token boundaries
   - Handle incomplete/invalid syntax gracefully

3. **Contenteditable Complexity**
   - Browser inconsistencies with contenteditable
   - Handling paste events (plain text only)
   - Preventing unwanted formatting

4. **Performance**
   - Efficient re-rendering on every keystroke
   - Avoid layout thrashing
   - Debouncing parse/highlight operations

5. **Autocomplete Positioning**
   - Calculate autocomplete position based on cursor
   - Show suggestions at current word, not at end of input
   - Context detection (field vs operator vs value)

## Reference Implementations

Similar patterns in existing tools:
- **Monaco Editor** (VS Code) - contenteditable with decorations
- **CodeMirror** - custom rendering with overlays
- **Algolia Query Builder** - inline syntax highlighting
- **GitHub Search** - keyword highlighting in search box
- **SQL Editors** - inline query syntax highlighting

## Files to Modify/Create

1. **`src/js/search-autocomplete-v2.js`** (new file)
   - New implementation with inline highlighting
   - Query parser
   - Syntax highlighter
   - Cursor/selection management

2. **`src/scss/core-components/_search-autocomplete.scss`**
   - Add styles for inline highlights
   - Different background colors for token types
   - Overlay positioning styles

3. **`views/table-filters.mustache`**
   - Update to use new autocomplete version
   - New HTML structure for inline editor

## Next Steps

1. Research best contenteditable approach for this use case
2. Create prototype with simple query parser
3. Implement cursor position management
4. Add syntax highlighting rendering
5. Integrate with existing autocomplete logic
6. Test thoroughly across browsers
7. Document usage and API

## User's Original Request

> "when I type :name and select a field it should automatically add a space behind it and show me available operators"

This was understood as wanting token-based approach, but user clarified:

> "the point is that I can write :name startswith abcd and :price between 1 to 3 and only parts of the query are colored with background color, so i can still go left and right with my cursor and update anything in the query"

Key insight: User wants **inline editing with syntax highlighting**, not separate token badges.

## Status
**Not Started** - Awaiting future implementation

This will require significant rewrite of the autocomplete component to support inline syntax highlighting instead of token-based approach.
