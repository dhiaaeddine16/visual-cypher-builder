
import { Select } from "@neo4j-ndl/react";

/**
 * A component that renders a dropdown select, or a non-interactive text label, depending on the value of `interactive`.
 * The component is used to render a part of a query block.
 * The component is supposed to be used in a `BlockComponent`.
 * @param {object} props - The component props.
 * @param {any[]} props.options - The options of the select.
 * @param {any} props.value - The value of the select.
 * @param {(newValue: string) => void} props.setValue - The function to call when the value of the select changes.
 * @param {(focus: boolean) => void} props.setInFocus - The function to call when the component is focused.
 * @param {boolean} props.interactive - Whether the component is interactive.
 * @param {object} [props.style] - The style of the component.
 */
export function BlockOption(props: { options: any[], value: any, setValue: (newValue: string) => void, setInFocus: (focus: boolean) => void, interactive: boolean, style?: any }) {
    const { options, value, setValue, interactive, style } = props;
    const baseOptions = options.map(option => ({ label: option, value: option }));

    // If the element is not rendered interactively, it's a 'fake' selector. This is for optimization reasons.
    if (!interactive) {
        return <div style={{
            border: style.border ? style.border : '1px solid transparent',
            borderRadius: '4px',
            paddingTop: '1px',
            paddingLeft: '5px',
            paddingRight: '2px',
            paddingBottom: '24px',
            lineHeight: '23px',
            minHeight: '12px',
            opacity: '1 !important',
            background: 'transparent',
            fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace',
            height: '28px',
            fontSize: '1 rem',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            color: 'black'
        }}>
            {value ? value : '...'}
        </div>
    } else {

        // If it is interactive, render the normal selector.
        return <Select label={''} type={'select'} selectProps={{
            options: baseOptions,
            inputValue: '',
            value: value,
            placeholder: value ? value : '...',


            tabSelectsValue: false,
            tabIndex: -1,
            onFocus: () => {
                props.setInFocus(true);
            },
            onChange: (value) => {
                setValue(value.value)
            },
            onBlur: () => {
                value && setValue(value);
                props.setInFocus(false);
            },
            styles: {
                container: (provided) => ({
                    marginRight: '-2px',
                    marginLeft: '-7px',
                    ...provided
                }),
                input: (provided) => ({
                    ...provided,
                    marginLeft: '-5px',
                    marginRight: '-5px',
                }),
                control: (provided) => ({
                    ...provided,
                    background: 'transparent',
                    border: style.border ? style.border : '1px solid transparent',
                    paddingLeft: '-4px',
                    paddingRight: '-4px',
                    marginLeft: '4px',
                    fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace',
                    fontSize: 'var(--font-size-body-large)',
                    lineHeight: '18px',
                    minHeight: '22px',
                    opacity: '1 !important',
                    color: 'black',
                }),

                dropdownIndicator: (provided) => ({
                    ...provided,
                    display: 'none'
                }),
                indicatorSeparator: (provided) => ({
                    ...provided,
                    display: 'none'
                }),

                placeholder: (provided) => ({
                    ...provided,
                    color: 'black',
                    margin: 0,
                    paddingLeft: '-8px',
                }),
                menu: (provided) => ({
                    ...provided,
                    fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace',
                    minWidth: '80px'
                }),
                option: (provided) => ({
                    ...provided,
                    fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace',
                })
            }
        }} />;
    }


}
