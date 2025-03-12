import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userReport } from "../redux/userSlice";
import { deleteReport, reportHandleChange } from "../redux/reportSlice";
import { useNavigate } from "react-router-dom";
import { Loading } from "../components";

const MyReports = () => {
  const dispatch = useDispatch();
  const { userReports, userLoading } = useSelector((store) => store.user);
  const { reportLoading } = useSelector((store) => store.report);
  const [showDetails, setShowDetails] = useState({
    show: false,
    details: {},
  });
  const [view, setView] = useState({
    show: false,
    src: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(userReport());

    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id) => {
    await dispatch(deleteReport(id)).unwrap();
    dispatch(userReport());
  };

  const handleContinue = (report) => {
    dispatch(reportHandleChange({ name: "contract", value: report._id }));
    dispatch(
      reportHandleChange({ name: "reportType", value: report.reportType })
    );
    dispatch(
      reportHandleChange({ name: "templateType", value: report.templateType })
    );
    setTimeout(() => {
      navigate(`/create/${report._id}`);
    }, 500);
  };

  return (
    <div className="container my-3">
      {(userLoading || reportLoading) && <Loading />}
      <h6 className="text-center text-danger mb-3">
        {userReports.length > 0
          ? "Uncompleted Reports"
          : "No Uncompleted Report Found"}
      </h6>
      {showDetails.show ? (
        <>
          <h6>Report Name - {showDetails.details?.reportName}</h6>
          <h6>Template Type - {showDetails.details?.templateType}</h6>
          <h6>Inspection Date - {showDetails.details?.inspectionDate}</h6>
          {view.show && (
            <div className="modal">
              <div className="modal-content">
                <img
                  src={view.src}
                  alt="img"
                  className="my-3"
                  style={{ height: 350 }}
                />
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setView({ show: false, src: "" })}
                >
                  Back
                </button>
              </div>
            </div>
          )}
          <table className="table table-striped-columns table-bordered reports-table">
            <thead>
              <tr>
                <th className="text-center" style={{ width: 70 }}>
                  Page
                </th>
                <th className="text-center">Floor</th>
                <th className="text-center">Images</th>
              </tr>
            </thead>
            <tbody>
              {showDetails.details?.details?.map((report, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{report.floor}</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        setView({ show: true, src: report.image1 })
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-around mt-5">
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleContinue(showDetails.details)}
            >
              Continue
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowDetails({ show: false, details: {} })}
            >
              Back
            </button>
          </div>
        </>
      ) : (
        <table className="table table-striped-columns table-bordered reports-table">
          <thead>
            <tr>
              <th className="text-center">Name</th>
              <th className="text-center" style={{ width: 80 }}>
                Date
              </th>
              <th className="text-center" style={{ width: 130 }}>
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {userReports?.map((report) => (
              <tr key={report._id}>
                <td>{report.reportName}</td>
                <td className="text-center">{report.inspectionDate}</td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-primary mx-1"
                    onClick={() =>
                      setShowDetails({ show: true, details: report })
                    }
                  >
                    Details
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(report._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default MyReports;
