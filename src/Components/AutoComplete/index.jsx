import React, { useState, useRef, useEffect, useCallback } from "react";
import getSuggestions from "../../Api/index";
import styles from "./index.module.css";

const AutoComplete = () => {
    const wrapperRef = useRef();
    const inputRef = useRef();
    const [pageState, setPageState] = useState({
        inputValue: "",
        options: [],
        activeIndex: 0,
        searchedWord: "",
        showOptions: false,
        allWords: []
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
        // Add timeout in API call. When user give short pause in typing then API will call
        const timer = setTimeout(() => {
            if (pageState.inputValue === inputRef.current.value) {
                // Do not show suggestions if input value is empty
                if (pageState.inputValue !== "") {
                    const lastCharacter = pageState.inputValue.slice(-1);
                    // Do not show suggestions if last character is space
                    if (lastCharacter === " ") {
                        handlePageState({ options: [], activeIndex: 0 });
                        return;
                    }
                    
                    const inputs = pageState.inputValue.split(" ").filter(
                        (word) => word !== "");
                    // Find suggestions based on last word
                    let lastWordFromInput = inputs[inputs.length - 1];
                    if(pageState.allWords.length) { 
                        const test = inputs.filter((word) => {
                            return (pageState.allWords.includes(word) === false);
                        });
                        if(test.length && pageState.showOptions === true) {
                            // Find suggestions based on changed word
                            lastWordFromInput = test.shift();
                        }
                    }
                    // Update all words
                    handlePageState({ allWords: inputs });
                    
                    handlePageState({ searchedWord: lastWordFromInput });
                    // Get All suggestions according to lastWordFromInput
                    getSuggestions(lastWordFromInput).then((suggestions) => {
                        handlePageState({ options: suggestions, activeIndex: 0, showOptions: true });
                    }).catch(console.error);
                } else {
                    handlePageState({ options: [], activeIndex: 0 });
                }
            }
        }, 500);
        return () => {
          clearTimeout(timer);
        };
    }, [pageState.inputValue, inputRef]);

    // Close options when click outside of div
    const handleClickOutside = useCallback((event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        handlePageState({ showOptions: false });
        }
    }, []);

    useEffect(() => {
        // We are only listning to an Event. We are not manupulating in DOM
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, [handleClickOutside]);

    // Highlights the matched characters in suggestions
    const highlightOption = (option) => {
        return option.replace(
        new RegExp(pageState.searchedWord, "gi"),
        (match) => `<span class="${styles.highlight}">${match}</span>`
        );
    };

    // Selecting suggestions through key press
    const handleKeyPress = (event) => {
        const { activeIndex, options } = pageState;
        if (event.keyCode === 13) { //Enter key
            onSelectOption(options[activeIndex]);
        } else if (event.keyCode === 38) { //Up Arrow key
            event.preventDefault();
            if (activeIndex === 0) {
                return;
            }
            handlePageState({ activeIndex: activeIndex - 1 });
        } else if (event.keyCode === 40) { //Down Arrow key
            event.preventDefault();
            if (activeIndex === options.length - 1) {
                return;
            }
            handlePageState({ activeIndex: activeIndex + 1 });
        }
    };

    // On select suggestion
    const onSelectOption = (inputOption) => {
        // If API does not return any result and value is selected, setting the typed value with space
        if (inputOption === undefined) {
          handlePageState({ inputValue: (pageState.inputValue !== "" && pageState.inputValue.slice(-1) !== " ") ? pageState.inputValue.concat(" ") : pageState.inputValue });
        } else {    
          let updatedValue = pageState.inputValue;
          if (pageState.inputValue !== "") {
            const words = pageState.inputValue.split(" ").map((w) => {
                return w === pageState.searchedWord ? w.replace(new RegExp(pageState.searchedWord, 'g'), inputOption) : w
            });
            updatedValue = `${words.join(" ")} `;
          }
          handlePageState({ inputValue: updatedValue, activeIndex: 0, options: [] });
        }
    
        // Set focus to input on select
        if (inputRef && inputRef.current) {
          inputRef.current.focus();
        }
    };

    return (
        <div ref={wrapperRef} className={styles.searchContainer}>
            <div className="form-group">
                <input
                    className={`form-control ${styles.inputSearch}`}
                    type="text"
                    spellCheck="false"
                    ref={inputRef}
                    value={pageState.inputValue}
                    onChange={event => handlePageState({ inputValue: event.target.value })}
                    onKeyDown={handleKeyPress}
                />
            </div>

            {pageState.showOptions && pageState.options.length !== 0 && (
                <div className={styles.optionsContainer}>
                {pageState.options.map((option, index) => (
                    <div
                    key={option}
                    className={
                        index === pageState.activeIndex ? styles.activeOption : styles.option
                    }
                    onClick={() => onSelectOption(option)}
                    dangerouslySetInnerHTML={{ __html: highlightOption(option) }}
                    />
                ))}
                </div>
            )}        
        </div>
    );
}

export default AutoComplete;
