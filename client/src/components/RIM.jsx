import { useState } from "react";
import { useDispatch } from "react-redux";
import { InputRow, InputSelect } from ".";
import { addAdminValues } from "../redux/adminSlice";
import { addNewPage, reportHandleChange } from "../redux/reportSlice";
import ImageEditor from "./ImageEditor";
import { useParams } from "react-router-dom";
import FinalReport from "./FinalReport";

const initialState = {
  pest: "",
  floor: "",
  subFloor: "",
  location: "",
  finding: "",
  suggestion: "",
  comment: "",
};

const RIM = ({
  reportType,
  findings,
  suggestions,
  comments,
  services,
  templateType,
  image1,
  image2,
  reportLoading,
  setLastPage,
  lastPage,
  reportName,
  user,
}) => {
  const [other, setOther] = useState({ find: "", suggest: "", comment: "" });
  const [imageModal, setImageModal] = useState({ show: false, name: "" });
  const [formValue, setFormValue] = useState(initialState);
  
  const { id } = useParams();
  const dispatch = useDispatch();

  const { pest, floor, subFloor, location, finding, suggestion, comment } =
    formValue;

  const next = async (e) => {
    e.preventDefault();
    if (!image1) return;
    else formValue.image1 = image1;
    if (templateType !== "Single Picture" && !image2) return;
    else formValue.image2 = image2;

    if (finding === "Other") {
      formValue.finding = other.find;
      dispatch(addAdminValues({ finding: other.find }));
    }
    if (suggestion === "Other") {
      formValue.suggestion = other.suggest;
      dispatch(addAdminValues({ suggestion: other.suggest }));
    }
    if (comment === "Other") {
      formValue.comment = other.comment;
      dispatch(addAdminValues({ comment: other.comment }));
    }
    if (reportType === "RIM") formValue.pest = "Rodent";

    dispatch(addNewPage({ formValue, id }))
      .unwrap()
      .then((res) => {
        dispatch(reportHandleChange({ name: "image1", value: null }));
        dispatch(reportHandleChange({ name: "image2", value: null }));
        setFormValue(initialState);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value });
  };

  const handleLastPage = async (e) => {
    if (image1) {
      await next(e);
    }
    setTimeout(() => {
      setLastPage(true);
    }, 500);
  };

  const showClose = () => {
    setImageModal({ show: false, name: "" });
  };

  return (
    <div>
      <div className="container row my-3">
        <h5 className="text-center">
          {!lastPage ? `${reportType} Report` : "Report Summary"}
        </h5>
        {!lastPage ? (
          <form onSubmit={next}>
            {reportType === "Pest Audit" && (
              <div className="col-md-6">
                <InputRow
                  label="Pest:"
                  type="text"
                  name="pest"
                  value={pest}
                  handleChange={handleChange}
                />
              </div>
            )}
            <div className="col-md-6">
              <InputRow
                label="Floor:"
                type="text"
                name="floor"
                value={floor}
                handleChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <InputRow
                label="Sub Floor:"
                type="text"
                name="subFloor"
                value={subFloor}
                handleChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <InputRow
                label="Location:"
                type="text"
                name="location"
                value={location}
                handleChange={handleChange}
              />
            </div>
            {(reportType === "RIM" || reportType === "Pest Audit") && (
              <>
                <div className="col-md-6">
                  <InputSelect
                    label="Findings:"
                    name="finding"
                    value={finding}
                    data={["Select", ...findings, "Other"]}
                    handleChange={handleChange}
                  />
                  {finding === "Other" && (
                    <InputRow
                      label="Finding"
                      type="text"
                      name="otherFinding"
                      value={other.find}
                      handleChange={(e) =>
                        setOther({ ...other, find: e.target.value })
                      }
                    />
                  )}
                </div>
                <div className="col-md-6">
                  <InputSelect
                    label="Suggestions:"
                    name="suggestion"
                    value={suggestion}
                    data={["Select", ...suggestions, "Other"]}
                    handleChange={handleChange}
                  />
                  {suggestion === "Other" && (
                    <InputRow
                      label="Suggestions"
                      type="text"
                      name="otherFinding"
                      value={other.suggest}
                      handleChange={(e) =>
                        setOther({ ...other, suggest: e.target.value })
                      }
                    />
                  )}
                </div>
              </>
            )}
            {reportType === "Work Done" && (
              <>
                <div className="col-md-6">
                  <InputSelect
                    label="Treatment:"
                    name="finding"
                    value={finding}
                    data={["Select", ...services]}
                    handleChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <InputSelect
                    label="Comments:"
                    name="comment"
                    value={comment}
                    data={["Select", ...comments, "Other"]}
                    handleChange={handleChange}
                  />
                  {comment === "Other" && (
                    <InputRow
                      label="Comments"
                      type="text"
                      name="otherComment"
                      value={other.comment}
                      handleChange={(e) =>
                        setOther({ ...other, comment: e.target.value })
                      }
                    />
                  )}
                </div>
              </>
            )}
            <div className="col-md-6 mt-3 mb-2 d-flex">
              <h4 className="img me-2">
                {templateType === "Before-After Picture"
                  ? "Before:"
                  : "Image1:"}
              </h4>
              <button
                className={`btn ${
                  image1 ? "btn-success" : "btn-primary"
                } btn-sm`}
                onClick={() => setImageModal({ show: true, name: "image1" })}
                type="button"
              >
                {image1 ? "Image Uploaded" : "Choose File"}
              </button>
            </div>
            <div className="col-md-6 my-2 d-flex">
              {templateType !== "Single Picture" && (
                <>
                  <h4 className="img me-2">
                    {templateType === "Before-After Picture"
                      ? "After:"
                      : "Image2:"}
                  </h4>
                  <button
                    className={`btn ${
                      image2 ? "btn-success" : "btn-primary"
                    } btn-sm`}
                    onClick={() =>
                      setImageModal({ show: true, name: "image2" })
                    }
                    type="button"
                  >
                    {image2 ? "Image Uploaded" : "Choose File"}
                  </button>
                </>
              )}
            </div>
            {imageModal.show && (
              <ImageEditor onClose={showClose} name={imageModal.name} />
            )}
            <div className="col-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  templateType === "Single Picture"
                    ? image1 === null
                      ? true
                      : false
                    : image2 === null
                    ? true
                    : false
                }
              >
                Next
              </button>
            </div>
            <div className="col-8 mt-4 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleLastPage}
              >
                Finish
              </button>
            </div>
          </form>
        ) : (
          <FinalReport id={id} name={user.name} />
        )}
      </div>
    </div>
  );
};
export default RIM;
