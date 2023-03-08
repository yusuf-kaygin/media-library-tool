import React from "react";
import { notifier } from "/client/js/notifier";
import { Uploader } from "/client/js/uploader";
import CustomModal from "/client/modules/customModal";
import MediaLibrary from "./mediaLibrary";
import { filePreview } from "./filePreview";
import "./style.css";

export default class FileUploader extends React.Component {
  state = {
    uploaderId: this.props.uploaderId !== undefined ? this.props.uploaderId : '',
    description: "",
    file: this.props.editInfo || {},
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
  handleUploadFile = (file) => {
    let { onUploadFile } = this.props

    if (Object.keys(file).length === 0) this.removeMediaItem(file);
    else this.addMediaItem(file);

    onUploadFile(file);
  };

  removeMediaItem = (file) => {
    this.setState({
      percentLoaded: 0,
      description: "",
      lock: false,
      file,
    });
  };

  addMediaItem = (file) => {
    let description = file.desc || file.description;
    if (file.desc === undefined) file.desc = description;

    this.setState({
      file,
      showMediaLibrary: false,
      lock: true,
      description,
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
    if (uploadStatus) setTimeout(this.checkLoadPercentage, 500);
    else if (!uploadStatus) this.setState({ uploadStatus });
  };

  renderUploadedFile(file) {
    let { url, fileName, desc, description } = file;
    return (
      url && (
        <div className="uploader-files">
          <div className="header-uploader">
            <div className="uploaded-file-info">
              <strong>
                {fileName || desc || description
                  ? fileName || desc || description
                  : "Yüklenen dosya"}
              </strong>
            </div>
            <div>
              <button
                className="btn btn-danger btn-sm file-remove-btn"
                type="button"
                onClick={() => this.handleUploadFile({})}
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      )
    );
  }

  uploadFile = (event) => {
    event.preventDefault();
    let { description } = this.state;
    let { uploaderId } = this.state;
    this.operationControl((error) => {

      if (!error) {
        if (description) document.querySelector(`.file-input-${uploaderId}`).click();
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
    let {
      description,
      percentLoaded,
      file,
      showMediaLibrary,
      uploadStatus,
      lock,
    } = this.state;
    return (
      <div className="custom-file-uploader">
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
          <div className="section-grid">
            <div className="uploader-content">
              <div>
                <input
                  type="text"
                  className="form-control"
                  disabled={
                    percentLoaded > 0 || uploadStatus || lock ? true : false
                  }
                  onChange={(e) => this.changeDescriptionInput(e.target.value)}
                  placeholder="Doküman Açıklaması"
                  value={description}
                />
              </div>

              <div className="uploader-buttons">
                <button className="btn" onClick={this.uploadFile}>
                  <div>
                    <i className="fa fa-file"></i>
                  </div>
                  {uploadStatus && (
                    <span>
                      Yükleniyor... <b>%{percentLoaded}</b>
                    </span>
                  )}
                  {!uploadStatus && "Dosya yükle"}
                </button>
                <input
                  type="file"
                  className={`file-input-${this.state.uploaderId}`} 
                  style={{ display: "none" }}
                  onChange={this.changeFileInput}
                  disabled={description && !uploadStatus ? false : true}
                />

                <button className="btn" onClick={this.openMediaLibrary}>
                  <div>
                    <i className="fa fa-photo"></i>
                  </div>
                  <div>Media kütüphanesi</div>
                </button>
              </div>

              {this.renderUploadedFile(file)}
            </div>
          </div>

          <div className="section-grid">
            <div
              className={`uploader-content ${
                Object.keys(file).length !== 0 ? "preview" : ""
              } `}
            >
              {Object.keys(file).length !== 0 && filePreview(file.url)}

              {Object.keys(file).length === 0 && (
                <div className="none-preview">
                  <span>Ön izleme</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ------------------------------------------------------------------------ */}

        <CustomModal
          isOpen={showMediaLibrary}
          headerContent="<h4>Media Kütüphanesi</h4>"
          modalStyle={{ width: "70%" }}
          bodyContent={
            <MediaLibrary
              handleUploadFile={this.handleUploadFile}
              showMediaLibrary={showMediaLibrary}
            />
          }
        />
      </div>
    );
  }
}
