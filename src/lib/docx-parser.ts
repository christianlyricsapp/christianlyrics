import JSZip from "jszip";

/**
 * Parses a DOCX file in the browser, extracting raw text paragraph by paragraph.
 */
export async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXmlFile = zip.file("word/document.xml");
  if (!docXmlFile) {
    throw new Error("Invalid DOCX format: word/document.xml not found.");
  }
  const xmlText = await docXmlFile.async("text");

  if (typeof window === "undefined") {
    throw new Error("Browser DOMParser is required to parse XML client-side.");
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");

  // Check for XML parsing error
  const parserError = xmlDoc.getElementsByTagName("parsererror");
  if (parserError.length > 0) {
    throw new Error("Failed to parse DOCX document XML structure.");
  }

  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  const extractedLines: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const runs = p.getElementsByTagName("w:r");
    let paragraphText = "";

    for (let j = 0; j < runs.length; j++) {
      const run = runs[j];
      const children = run.childNodes;

      for (let k = 0; k < children.length; k++) {
        const child = children[k];
        if (child.nodeName === "w:t") {
          paragraphText += child.textContent || "";
        } else if (child.nodeName === "w:br") {
          paragraphText += "\n";
        }
      }
    }

    // Keep blank lines (represented by empty paragraphText) to help with song/stanza splitting
    extractedLines.push(paragraphText.trim());
  }

  return extractedLines.join("\n").trim();
}
