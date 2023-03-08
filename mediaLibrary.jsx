import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { getCdnUrl } from "../../../lib/cdn-url";
import BasicFileUploader from "./basic";
import { filePreview } from "./filePreview";
import { notifier } from "/client/js/notifier";
import SelectList from "/client/modules/common/selectlist.js";

class mediaLibrary extends Component {
  state = {
    medias: [],
    loading: true,
    searchText: "",
    role: "",
    teacherList: [],
    selectedTeacherId: "",
    page: 1,
    postPerPage: this.props.postPerPage || 6, // sayfada kac veri olacak
    selectedFileType: "",
    mediasCount: 0,
    tenantList: [],
    selectedTenantId: "",
  };

  componentDidMount = () => {
    setTimeout(this.init, 100);
  };

  init = () => {
    this.getMedia();
    this.getTeacher();
    this.keyControl();
    this.getTenantList();
  };

  getTenantList = () => {
    Meteor.call("tenants.getAll", (err, res) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({
          tenantList: res,
        });
      }
    });
  };

  keyControl = () => {
    addEventListener("keydown", (event) => {
      let { loading } = this.state;
      if (!loading) {
        if (event.key === "ArrowRight") this.pagination("next");
        if (event.key === "ArrowLeft") this.pagination("prev");
      }
    });

    this.pagination("prev");
  };

  getMedia = () => {
    let {
      selectedTeacherId,
      page,
      postPerPage,
      selectedFileType,
      searchText,
      selectedTenantId,
    } = this.state;
    this.setState({ loading: true });

    Meteor.call(
      "getMedias",
      selectedTeacherId,
      { page, postPerPage, selectedFileType, searchText, selectedTenantId },
      (err, res) => {
        if (!err) {
          this.setState({
            page: res.page,
            medias: res.medias,
            role: res.role[0],
            loading: false,
            mediasCount: res.mediasCount,
          });
        }
      }
    );
  };

  pagination = async (status) => {
    let { page } = this.state;

    if (status === "next")
      await this.setState({
        page: page + 1,
      });

    if (status === "prev") {
      await this.setState({
        page: page - 1,
      });
    }

    await this.getMedia();
  };

  removeMedia = (mediaId) => {
    if (confirm("Bu işlemi yapmak istediğinize emin misiniz?")) {
      let selectedElement = document.querySelector(`#media-${mediaId}`);
      selectedElement.style.display = "none";
      Meteor.call("deleteMedia", mediaId, (err, res) => {
        if (err) {
          // eger hata cikarsa client'te sildigimiz elemani tekar ekliyoruz
          selectedElement.style.display = "block";
          notifier.send("Silme işlemi başarısız oldu.", "error");
        } else {
          notifier.send("Media öğeniz silindi.", "success");
          this.getMedia();
        }
      });
    }
  };

  getTeacher = () => {
    let { selectedTenantId } = this.state;
    Meteor.call("teacher.getAll", selectedTenantId, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({
          teacherList: res,
        });
      }
    });
  };

  selectMediaItem = (media) => {
    this.props.handleUploadFile(media);
  };

  fileSearch = async (searchText) => {
    await this.setState({ searchText });
    await this.getMedia();
  };

  resetSearchText = () => {
    let { searchText } = this.state;
    if (searchText.length !== 0) this.fileSearch("");
    this.setState({
      searchText: "",
    });
  };

  changeSelectedTeacher = async (selectedTeacherId) => {
    await this.setState({
      selectedTeacherId,
      searchText: "",
    });
    await this.getMedia();
  };

  onUploadFile = () => this.getMedia();

  changeSelectedFileType = async (selectedFileType) => {
    await this.setState({ selectedFileType });
    await this.getMedia();
  };

  changeSelectedTenant = async (selectedTenantId) => {
    await this.setState({
      selectedTenantId: selectedTenantId,
      selectedTeacherId: "",
    });
    await this.getMedia();
    await this.getTeacher();
  };

  contentWrap = (word) => {
    if (word.length >= 20) return word.slice(0, 20) + "...";
    else return word;
  };

  render() {
    let {
      medias,
      loading,
      searchText,
      role,
      teacherList,
      page,
      mediasCount,
      tenantList,
    } = this.state;
    let { mode } = this.props;

    let found = medias.length > 0 && !loading;
    let notFound = medias.length == 0 && !loading;

    return (
      <div>
        <div className="media-library-header">
          <div className="basic-uploader-filter">
            <div>
              {role === "root" && (
                <SelectList
                  selectedOption={""}
                  defaultOption={"Kurum seç (Mevcut kurum)"}
                  list={tenantList}
                  onChangeList={(elem) => this.changeSelectedTenant(elem.value)}
                />
              )}
            </div>
            <div>
              <SelectList
                selectedOption={""}
                defaultOption="Dosya tipi seç (hepsi)"
                list={[
                  { _id: "image", name: "Resim" },
                  { _id: "video", name: "Video" },
                  { _id: "sound", name: "Ses" },
                  { _id: "pdf", name: "Pdf" },
                  { _id: "word", name: "Word" },
                  { _id: "excel", name: "Excel" },
                ]}
                onChangeList={(elem) => this.changeSelectedFileType(elem.value)}
              />
            </div>
          </div>

          <div className="basic-uploader-filter">
            {role == "root" || role == "corpManager" ? (
              <div>
                <SelectList
                  selectedOption={""}
                  defaultOption="Eğitmen Seç (hepsi)"
                  list={teacherList}
                  onChangeList={(elem) =>
                    this.changeSelectedTeacher(elem.value)
                  }
                />
              </div>
            ) : null}

            <div>
              <input
                type={"search"}
                className="form-control"
                placeholder="Dosya ara"
                onChange={(event) => this.fileSearch(event.target.value)}
                onClick={this.resetSearchText}
                value={searchText}
              />
            </div>
          </div>
        </div>

        {mode == "page" && (
          <div className="bs-file-uploader">
            <h3>Dosyalar</h3>
            <BasicFileUploader onUploadFile={this.onUploadFile} />
          </div>
        )}

        {found && (
          <div>
            <div className="row">
              {medias.map((media) => (
                <div
                  className="col-md-4"
                  key={media._id}
                  id={`media-${media._id}`}
                >
                  <div className="media-card">
                    <div className="md-body">{filePreview(getCdnUrl(media.url))}</div>
                    <div className="md-footer">
                      <div
                        className="file-description"
                        title={media.description}
                      >
                        {this.contentWrap(media.description)}
                      </div>
                      <div>
                        <span
                          className="btn btn-sm remove-btn media-operation-btn"
                          onClick={() => this.removeMedia(media._id)}
                        >
                          <i className="fa fa-trash"></i>
                          <span>Sil</span>
                        </span>
                        {mode == undefined && (
                          <span
                            className="btn btn-sm selected-btn media-operation-btn"
                            onClick={() => this.selectMediaItem(media)}
                          >
                            <span>Seç</span>
                            <i className="fa fa-check"></i>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bottom-fixed">
              <div className="file-paginate">
                <div>
                  <span className="page-info">{page}. Sayfa</span> - Toplam{" "}
                  {mediasCount} kayıt
                </div>
                <div>
                  Yön tuşları <i className="fa fa-arrow-left"></i>{" "}
                  <i className="fa fa-arrow-right"></i> ile medya içerisinde
                  gezinebilirsiniz.
                </div>
                <div>
                  <button
                    className="btn prev-btn"
                    onClick={() => this.pagination("prev")}
                  >
                    <i className="fa fa-arrow-left"></i>
                    Geri
                  </button>
                  <button
                    className="btn next-btn"
                    onClick={() => this.pagination("next")}
                  >
                    Ileri <i className="fa fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {notFound && (
          <div className="data-info-text">
            <span>Veri Bulunamadı.</span>
          </div>
        )}
        {loading && (
          <div className="data-info-text">
            <span>Yükleniyor...</span>
          </div>
        )}
      </div>
    );
  }
}

export default mediaLibrary;
