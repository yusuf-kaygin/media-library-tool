import React from "react";
import { notifier } from "/client/js/notifier";
import { Uploader } from "/client/js/uploader";
import { filePreview } from "./filePreview";
import "./style.css";

export default class BasicFileUploader extends React.Component {
  state = {
    description: "",
    file: {},
    percentLoaded: 0,
    showMediaLibrary: false,
    uploadStatus: false,
    lock: false,
  };

  componentDidMount = () => {
    $(".modal").on("hidden.bs.modal", () => {
      this.setState({ showMediaLibrary: false });
    });
  };

  // ust bilesenu media kutuphanesinden veya dosya indirden islem yapilan dosyayi iletir
  handleUploadFile = () => {
    this.props.onUploadFile();
  };

  removeMediaItem = () => {
    this.setState({
      description: "",
      lock: false,
      file: {},
      percentLoaded: 0,
    });
  };

  changeDescriptionInput = (description) => {
    this.setState({
      description,
    });
  };

  // yukleme tamamlandiginda calisan alan
  changeFileInput = (event) => {
    event.preventDefault();
    let { description } = this.state;
    let file = event.currentTarget.files[0];
    let settings = {
      desc: description,
      onUpload: (error, file) => {
        if (!error) {
          this.handleUploadFile(file);
        }
      },
    };
    Uploader.uploadFileMediaNova(file, settings);
    this.checkLoadPercentage();
  };

  checkLoadPercentage = () => {
    let uploadStatus = Session.get("uploadStatus"); // true = upload devam ediyor & false = upload bitti
    let percentLoaded = Session.get("percentLoaded") || 0;
    this.setState({ percentLoaded, uploadStatus });
    if (percentLoaded == 100) setTimeout(this.removeMediaItem, 1000);
    if (uploadStatus) setTimeout(this.checkLoadPercentage, 500);
    else if (!uploadStatus) this.setState({ uploadStatus });
  };

  uploadFile = (event) => {
    event.preventDefault();
    let { description } = this.state;
    this.operationControl((error) => {
      if (!error) {
        if (description) document.querySelector(".file-input").click();
        else notifier.send("Doküman açıklaması doldurulmalı.", "error");
      }
    });
  };

  openMediaLibrary = (event) => {
    event.preventDefault();
    this.operationControl((error) => {
      if (!error) {
        this.setState({ showMediaLibrary: true });
      }
    });
  };

  operationControl = (callback) => {
    // yukleme yapilirken bug olmamasi
    let { uploadStatus, file } = this.state;
    if (Object.keys(file).length !== 0) {
      notifier.send(
        "Yeni bir dosya eklemek için mevcut seçilen dosyayı kaldırmanız gerekiyor.",
        "error"
      );

      callback(true);
      return;
    }
    if (uploadStatus) {
      notifier.send("Yükleme yapılırken dosya eklenemez.", "error");
      callback(true);
      return;
    }
    callback(false);
  };

  render() {
    let { description, percentLoaded, uploadStatus, lock } = this.state;

    return (
      <div className="custom-file-uploader basic-uploader">
        {/* ---------------- custom-progress-bar start ----------------------------- */}
        <div id="custom-progress-bar" className="progress">
          <div
            className="progress-bar bg-success"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={10}
            style={{ width: `${percentLoaded}%` }}
          ></div>
        </div>
        {/* ------------------------------------------------------------------------ */}

        {/* ---------------- uploader-body start ----------------------------------- */}
        <div className="file-uploader-body">
          <div className="uploader-content">
            <div>
              <input
                type="text"
                className="form-control"
                disabled={uploadStatus || lock ? true : false}
                onChange={(e) => this.changeDescriptionInput(e.target.value)}
                placeholder="Doküman Açıklaması"
                value={description}
              />
            </div>

            <div className="uploader-buttons">
              <button className="btn" onClick={this.uploadFile}>
                {uploadStatus && (
                  <span>
                    Yükleniyor... <b>%{percentLoaded}</b>
                  </span>
                )}
                {!uploadStatus && "Dosya yükle"}
              </button>
              <input
                type="file"
                className="file-input"
                style={{ display: "none" }}
                onChange={this.changeFileInput}
                disabled={description && !uploadStatus ? false : true}
              />
            </div>
          </div>
        </div>
        {/* ------------------------------------------------------------------------ */}
      </div>
    );
  }
}
