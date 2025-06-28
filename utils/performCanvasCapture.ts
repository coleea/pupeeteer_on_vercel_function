export const performCanvasCapture = async (page: any, canvasSelector: string) => {
  try {
    // get the base64 image from the CANVAS targetted
    const base64 = await page.$eval(canvasSelector, (el) => {
      if (!el || el.tagName !== "CANVAS") return null;
      return el.toDataURL();
    });
    if (!base64) throw new Error("No canvas found");
    // remove the base64 mimetype at the beginning of the string
    const pureBase64 = base64.replace(/^data:image\/png;base64,/, "");
    return Buffer.from(pureBase64, "base64");
  } catch (err) {
    return null;
  }
};