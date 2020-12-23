import React from "react";

const AutoComplete = () => {

  return (
    <div className="container">            
      <div className="form-group">
          <input
            className="form-control"
            type="text"
            spellCheck="false"
          />
      </div>

      <div>Suggestions will be here</div>
      
    </div>
  );
}

export default AutoComplete;
