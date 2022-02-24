export class KeyboardInput {
  static sendChar(char: string) {
    const key = char.charAt(0);
    const keyCode = 65 + key.charCodeAt(0) - "a".charCodeAt(0);
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        keyCode,
        code: "Key" + key.toUpperCase(),
        which: keyCode,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      })
    );
  }

  static sendEnter() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 13,
        code: "Enter",
        which: 13,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
      })
    );
  }
}
