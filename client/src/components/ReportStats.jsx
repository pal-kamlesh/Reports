import { useState } from "react";
import { useDispatch } from "react-redux";
import { sortReportsByEmailSend, sortReportsbyCreatedAt } from "../redux/reportSlice";
const ReportStats = ({ data }) => {
  const dispatch = useDispatch();
  const [sorted, setSorted] = useState(false);
  const handleSort = () => {
    if (sorted) {
      setSorted(false);
      dispatch(sortReportsbyCreatedAt());
    } else {
      dispatch(sortReportsByEmailSend());
      setSorted(true);
    }
  };
  return (
    <div className="row mb-2">
      {data?.map((item, index) => {
        if (item.text === "Email Not Sent") {
          return (
            <div className="col-md-3" style={{ cursor: "pointer" }} key={index} onClick={handleSort}>
              <div className={`card bg-${item.bg}`}>
                <div className="card-body text-center">
                  <p className="card-text" style={{ color: "white" }}>
                    {item.text}
                  </p>
                  <h2 style={{ marginBottom: 0, color: "white" }}>
                    {item.count}
                  </h2>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="col-md-3" key={index}>
              <div className={`card bg-${item.bg}`}>
                <div className="card-body text-center">
                  <p className="card-text" style={{ color: "white" }}>
                    {item.text}
                  </p>
                  <h2 style={{ marginBottom: 0, color: "white" }}>
                    {item.count}
                  </h2>
                </div>
              </div>
            </div>
          );
        }
      })}
    </div >
  );
};
export default ReportStats;
