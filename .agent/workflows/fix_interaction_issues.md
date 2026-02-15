---
description: Debug and fix interaction/click issues in Vue/Capacitor apps.
---

1. **Diagnosis Strategy & Analysis**
   - **Symptom**: "Clicking doesn't work" or "Triggering the wrong action" (e.g. expanding a card instead of opening a menu).
   - **Root Cause Analysis**: 
     - **Event Propagation (Bubbling)**: When a clickable element (like a button) is inside another clickable element (like a list item or card), the click triggers the child *first*, then bubbles up to the parent.
     - The parent's handler often overrides or conflicts with the child's intention (e.g., closing the card immediately after the button tries to act).
   - **Verification**: Add `console.log` or `alert` to *both* handlers. If the parent handler fires when clicking the child, it's propagation.

2. **The Fix: `@click.stop`**
   - **Rule**: ALWAYS add the `.stop` modifier to click events on nested interactive elements.
   - **Code Pattern**:
     ```html
     <!-- Parent: Toggle Expand -->
     <div class="list-item" @click="toggleExpand(item.id)">
         
         <!-- Child: Action Button -->
         <!-- WRONG: <button @click="handleAction"> -->
         <!-- RIGHT: -->
         <button @click.stop="handleAction">Call</button>

         <!-- Child Container: Expanded Menu -->
         <div class="expanded-menu" @click.stop>
             <!-- Grandchild: Specific Action -->
             <div @click.stop="handleAction('move')">Move To</div>
         </div>
     </div>
     ```
   - **Why**: `stop` calls `event.stopPropagation()`, ensuring the event *only* affects the target element.

3. **Validation Checklist**
   - [ ] Does the button have `@click.stop`?
   - [ ] Does the *container* of the buttons (if overlaying the parent) have `@click.stop`?
   - [ ] Is `z-index` sufficient? (Overlays must have higher z-index than content).

4. **Troubleshooting "No Changes" (Caching Issues)**
   If you apply the fix but the app acts exactly the same (no alert, old behavior):
   - **Cause**: Android/Capacitor is running a cached version of `index.html`/JS.
   - **Solution (Force Clean Build)**:
     1. **Uninstall** the app from the device: `adb uninstall com.package.name`
     2. **Clean Web Assets**: Delete `dist` folder.
     3. **Clean Android Assets**: Delete `android/app/src/main/assets/public`.
     4. **Rebuild**: `npm run build` -> `npx cap sync android`.
     5. **Re-install**: `adb install ...`
   - **Visual Verification**: Always add a temporary visual change (e.g. change text "Move to" -> "Move to...") to confirm the new build is running.

5. **Heuristics for Future Automation**
   - **Pattern**: User complains "I clicked X but Y happened". -> **Action**: Check for nested click handlers.
   - **Pattern**: User complains "I updated code but nothing changed". -> **Action**: Force Clean Build & Uninstall.
