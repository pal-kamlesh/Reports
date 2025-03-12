import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearReport,
  getReportDetails,
  submitReport,
} from "../redux/reportSlice";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";

const FinalReport = ({ id, name }) => {
  const { singleReport, reportLoading } = useSelector((store) => store.report);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getReportDetails(id));

    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async () => {
    try {
      await dispatch(submitReport(id)).unwrap();
      dispatch(clearReport());
      navigate("/newReport");
    } catch (error) {
      console.log(error);
    }
  };

  if (reportLoading) return <Loading />;

  return (
    <div>
      <div className="col-md-6 my-3">
        <h4>Report Name - {singleReport.reportName}</h4>
        <h4>Report Pages - {singleReport.details?.length + 2}</h4>
        <h4>Report By - {name}</h4>
      </div>
      <div className="col-md-6 d-flex justify-content-center mt-5">
        <button
          className="btn btn-success mt"
          onClick={handleSubmit}
          disabled={
            reportLoading || isNaN(singleReport.details?.length) ? true : false
          }
        >
          {reportLoading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
};
export default FinalReport;
