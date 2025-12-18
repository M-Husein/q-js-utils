export type downloadData = Blob | File;

export type DownloadOptions = {
  name?: string;
  timeout?: number; // Default fallback if requestIdleCallback is unavailable
};

/**
 * Initiates a file download from a given Blob or File in modern browsers.
 * Automatically handles Safari compatibility and revokes the object URL after use.
 *
 * @param {Blob | File} data - The binary data to download.
 * @param {DownloadOptions} [options] - Optional configuration for the download.
 * @param {string} [options.name=""] - Suggested filename for the downloaded file.
 * @param {number} [options.timeout=500] - Delay before revoking the object URL (in milliseconds).
 * @returns {Promise<number>} Resolves after the object URL is revoked; rejects if data is invalid.
 */
export const download = (
  data: downloadData,
  {
    name = "",
    timeout = 500,
  }: DownloadOptions = {}
): Promise<number> => 
  new Promise((resolve, reject) => {
    if(data instanceof Blob && data.size > 0){
      let a = document.createElement("a"),
          objectUrl = URL.createObjectURL(data),
          uA = navigator.userAgent;

      a.href = objectUrl;
      a.download = name;

      /**
       * @Compatibility : Safari may require DOM append
      */
      if(/Safari/.test(uA) && !/Chrome/.test(uA)){
        a.hidden = true;
        a.rel = "noopener noreferrer"; // For security

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      else{
        a.click(); // Works fine in Chrome, Firefox, Edge
      }
      
      // Cleanup
      const cleanURL = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(1);
      }

      "requestIdleCallback" in window 
        ? requestIdleCallback(cleanURL) 
        : setTimeout(cleanURL, timeout);
    }
    else reject(0);
  });
