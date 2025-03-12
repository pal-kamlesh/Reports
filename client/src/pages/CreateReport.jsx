import { useEffect, useState } from "react";
import { Loading, RIM } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAdminValues } from "../redux/adminSlice";

const CreateReport = () => {
  const {
    reportLoading,
    image1,
    image2,
    contract,
    reportName,
    details,
    reportType,
    templateType,
  } = useSelector((store) => store.report);
  const { adminLoading, findings, suggestions, services, comments } =
    useSelector((store) => store.admin);
  const { user } = useSelector((store) => store.user);
  const [lastPage, setLastPage] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAdminValues());
    if (!contract) navigate("/newReport");

    // eslint-disable-next-line
  }, []);

  if (adminLoading) return <Loading />;
  return (
    <div className="container">
      <RIM
        reportType={reportType}
        findings={findings}
        suggestions={suggestions}
        services={services}
        comments={comments}
        templateType={templateType}
        image1={image1}
        image2={image2}
        reportLoading={reportLoading}
        lastPage={lastPage}
        setLastPage={setLastPage}
        reportName={reportName}
        details={details}
        user={user}
      />
    </div>
  );
};
export default CreateReport;
