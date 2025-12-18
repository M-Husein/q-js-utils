# download

Triggers a file download from a given Blob or File object in modern browsers.

## Usage
```ts
import { download } from 'q-js-utils/download';
```
Recommended for tree-shaking. 

**Or**

```ts
import { download } from 'q-js-utils';
```

```ts
import { download } from 'q-js-utils/download';

const text = new Blob(["Hello Husein 👋"], { type: "text/plain" });

// Basic
download(text);

// Custom filename
download(text, {
  name: "greeting.txt"
});

// Custom timeout to cleanup createObjectURL
download(text, {
  timeout: 1000,
});

// Whether to append anchor to DOM for Safari compatibility
download(text, {
  append: true,
});

// All
download(text, {
  name: "greeting.txt",
  timeout: 1000,
  append: true,
});
```

## From file
```ts
import { useRef } from 'react';
import { download } from 'q-js-utils/download';

const App = () => {
  const fileRef = useRef(null);

  const downloadFile = () => {
    const file = fileRef.current.files[0];
    if(file){
      download(file);
    }
  }

  return (
    <div>
      <h1>Download file</h1>
      <input ref={fileRef} type="file" />
      <button type="button" onClick={downloadFile}>Download</button>
    </div>
  );
}
```

## From fetch data
```ts
import { useEffect } from 'react';
import { download } from 'q-js-utils/download';
import { request } from 'q-js-utils/request';

const App = () => {
  useEffect(() => {
    (async () => {
      try {
        const response = await request('/path/image.jpg').blob();
        if(response){
          download(response);
        }
      } catch(err){
        console.error(err)
      }
    })();
  }, []);

  return (
    <div>
      <h1>Auto Download file</h1>
    </div>
  );
}
```

---

## Optional

```ts
export type DownloadOptions = {
  name?: string;
  timeout?: number; // Default fallback if requestIdleCallback is unavailable
  forceAppend?: boolean; // For Safari or older Firefox to append DOM
};

export const download = (
  data: downloadData,
  {
    name,
    timeout = 500,
    append,
  }: DownloadOptions = {}
): Promise<void> => 
  new Promise((resolve, reject) => {
    if(data instanceof Blob && data.size > 0){
      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(data);

      a.href = objectUrl;
      a.download = (name && name.trim()) || "download";

      /** Without browser checking */
      // a.click();

      /** Compatibility: Safari may require DOM append */
      if(forceAppend || (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))){
        a.rel = "noopener noreferrer"; // For security
        a.hidden = true; // a.style.display = "none";

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
        resolve();
      }

      "requestIdleCallback" in window ? requestIdleCallback(cleanURL) : setTimeout(cleanURL, timeout);
      return;
    }

    reject(new Error("Download aborted: Invalid Blob/File."));
  }):
}
```
