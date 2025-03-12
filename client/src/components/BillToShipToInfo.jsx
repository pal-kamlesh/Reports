import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function BillToShipToInfo({ btnText, contract }) {

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            <div className='d-flex flex-column'>
                <div className='d-flex flex-column justify-content-start align-items-center'>
                    <p className='text-primary'><span className='text-white'>Bill To Name:</span> {contract.billToName}</p>
                    <p className='text-primary'><span className='text-white'>Bill To Address:</span> {contract.billToAddress}</p>
                </div>
                <hr className="bg-white my-4" />

                <div className='d-flex flex-column justify-content-start align-items-center'>
                    <p className='text-primary'><span className='text-white'>Ship To Name:</span> {contract.shipToName}</p>
                    <p className='text-primary'><span className='text-white'>Ship To Address:</span> {contract.shipToAddress}</p>
                </div>
            </div>
        </Tooltip>
    );

    return (
        <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
        >
            <Button variant="success" style={{ backgroundColor: "#7D5A50", cursor: "default" }}>{btnText}</Button>
        </OverlayTrigger>
    );
}

export default BillToShipToInfo;