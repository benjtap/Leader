---
description: Debug and fix interaction/click issues in Vue/Capacitor apps.
---

1. **Diagnosis Strategy**
   - **Symptom**: "Clicking doesn't work" or "Triggering the wrong action".
   - **Common Cause**: Event propagation (bubbling). When a button is inside a clickable card/row, clicking the button also clicks the row.
   - **Verification**: Add `console.log` or `alert` to *both* the child and parent handlers. If both fire, it's a propagation issue.

2. **The Magic Fix: `@click.stop`**
   - In Vue, always attach `.stop` modifier to buttons nested inside other clickable elements.
   - **Pattern**:
     ```html
     <!-- Parent (e.g., Row Expand) -->
     <div @click="toggleRow">
         <!-- Child (e.g., Action Button) -->
         <button @click.stop="doAction">Icon</button>
     </div>
     ```
   - **Why**: This calls `event.stopPropagation()`, preventing the event from bubbling up to the parent.

3. **Checklist for Future Issues**
   - [ ] Is the element or its parent clickable?
   - [ ] Did I add `@click.stop` to the child handler?
   - [ ] Is there an overlay (z-index issue) blocking clicks? (Check with Inspector)
   - [ ] Is the click target size too small? (Add padding)

4. **Debugging Steps (Agentic)**
   - **Step 1**: Locate the component file.
   - **Step 2**: Search for the `@click` handler.
   - **Step 3**: Check parent elements for conflicting click handlers.
   - **Step 4**: Apply `@click.stop`.
   - **Step 5**: Rebuild and test.
