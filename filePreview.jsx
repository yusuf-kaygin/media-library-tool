import { generateCode } from "/lib/generate-code.js";
import { getCdnPublicUrl } from "/lib/cdn-url.js";
import { forceSsl } from "/lib/helpers";

var mime = require("mime-types");

let imageMimeTypes = [
  "image/jpeg",
  "image/cis-cod",
  "image/gif",
  "image/ief",
  "image/pipeg",
  "image/svg+xml",
  "image/tiff",
  "image/png",
  "image/webp",
  "image/jpm",
  "image/jpx",
];

let videoMimeTypes = [
  "video/x-flv",
  "video/mp4",
  "application/x-mpegUR",
  "video/MP2T",
  "video/3gpp",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/x-m4v"
];

let voiceMimeTypes = [
  "audio/mpeg",
  "audio/basic",
  "auido/L24",
  "audio/mid",
  "audio/mp4",
  "audio/x-aiff",
  "audio/x-mpegurl",
  "audio/vnd.rn-realaudio",
  "audio/ogg",
  "audio/vorbis",
  "audio/vnd.wav",
];

// iframe icin gerekli
let urlLink = (url) => {
  var now = new Date().getTime();
  const randomCode = generateCode(now.toString());
  const link =
    "https://docs.google.com/gview?url=" +
    getCdnPublicUrl(url) +
    "&embedded=true&" +
    randomCode;
  return link;
};

let mediaUrl = (type, url) => {
  if (type === "audio/mp3") {
    return "https://kursadresi-public-image.mncdn.com/kursadresi/default-files/img/597931-200.png";
  }
  if (
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    type === "application/msword"
  ) {
    return "https://kursadresi-public-image.mncdn.com/kursadresi/default-files/img/word.PNG";
  }
  if (
    type ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return "https://kursadresi-public-image.mncdn.com/kursadresi/default-files/img/word.PNG";
  }
  if (type === "text/plain") {
    return "https://kursadresi-public-image.mncdn.com/kursadresi/default-files/img/text-plain.png";
  }
  if (type === "application/pdf") {
    return "https://kursadresi-public-image.mncdn.com/kursadresi/default-files/img/text-plain.png";
  }

  if (url) {
    return url && url.startsWith("http") ? url : forceSsl() + url;
  }
};

let videoPreview = (type, url) => {
  let link = mediaUrl(type, url);

  return (
    <video
      className="width-100-percent"
      muted
      controls
      playsInline
      src={link}
    ></video>
  );
};

let imagePreview = (type, url) => {
  let link = mediaUrl(type, url);
  return <img src={link} />;
};

let voicePreview = (type, url) => {
  return (
    <audio controls>
      <source src={mediaUrl(type, url)} type={type} />
      Your browser does not support the audio tag.
    </audio>
  );
};

let defaulPreview = (url) => {
  let link = urlLink(url);
  return <iframe src={link} />;
};

// NOTE main method
let filePreview = (url) => {
  let mimeType = mime.lookup(url);
  
  let isVideo = videoMimeTypes.includes(mimeType);
  let isImage = imageMimeTypes.includes(mimeType);
  let isVoice = voiceMimeTypes.includes(mimeType);

  if(mimeType == false && url.includes('.jfif')) return imagePreview('image/jpeg', url);
  
  if (isVideo) return videoPreview(mimeType, url);
  else if (isImage) return imagePreview(mimeType, url);
  else if (isVoice) return voicePreview(mimeType, url);
  else return defaulPreview(url);
};

export { filePreview };
