import React, { useState, useRef, useEffect } from "react";
import getSuggestions from "../../Api/index";

const AutoComplete = () => {
    const inputRef = useRef();
    const [pageState, setPageState] = useState({
        inputValue: "",
        options: [],
        activeIndex: 0,
        searchedWord: "",
        showOptions: false,
    });

    const handlePageState = (newStates) => {
        setPageState((prevStates) => {
        return {
            ...prevStates,
            ...newStates
        };
        });
    }

    useEffect(() => {
        // Do not show suggestions if input value is empty
        if (pageState.inputValue !== "") {
            const lastCharacter = pageState.inputValue.slice(-1);
            // Do not show suggestions if last character is space
            if (lastCharacter === " ") {
              handlePageState({ options: [], activeIndex: 0 });
              return;
            }
  
            // Find suggestions based on last word
            const inputs = pageState.inputValue.split(" ").filter((word) => word !== "");
            const lastWordFromInput = inputs.pop();
            
            handlePageState({ searchedWord: lastWordFromInput });
            getSuggestions(lastWordFromInput).then((suggestions) => {
              handlePageState({ options: suggestions, activeIndex: 0, showOptions: true });
            }).catch(console.error);
        } else {
            handlePageState({ options: [], activeIndex: 0 });
        }
    }, [pageState.inputValue, inputRef]);

    return (
        <div className="container">
            <div className="form-group">
                <input
                    className="form-control"
                    type="text"
                    spellCheck="false"
                    ref={inputRef}
                    value={pageState.inputValue}
                    onChange={event => handlePageState({ inputValue: event.target.value })}
                />
            </div>

            {pageState.showOptions && pageState.options.length !== 0 && (
                <div>
                    {pageState.options.map((option) => (
                        <div key={option}>{option}</div>
                    ))}
                </div>
            )}        
        </div>
    );
}

export default AutoComplete;
