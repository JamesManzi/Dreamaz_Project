import "./Spinner.css";
function Spinner({ text = "Loading..." }) {
    return (
        <div className="spinner-wrapper">
            <span className="spinner"></span>
            <span>{text}</span>
        </div>
    );
}

export default Spinner;