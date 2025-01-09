
import { Select } from "@neo4j-ndl/react";
import { useState } from "react";
import { constructComplexVariables } from "../../logic/VariablesLogic";

function deduplicateDictList(dictList: any[]) {
    const seen = new Set();
    return dictList.reduce((result: any[], item: any) => {
        const key = JSON.stringify(item);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(item);
        }
        return result;
    }, []);
}

function renderValue(value: any) {
    if (typeof value === 'object') {
        return "'" + value.toString() + "'";
    }
    if (value === undefined) {
        return 'undefined';
    }
    return value;
}

export function BlockSelect(props: { schema: any, variables: any, class: any, value: any, setValue: (newValue: string) => void, setInFocus: (focus: boolean) => void, interactive: boolean }) {
    const { schema, variables, value, setValue, interactive } = props;
    const [inFocus, setInFocus] = useState(false);


    // const baseOptions = [{ label: 'abc', value: 'abc' }, { label: 'def', value: 'def' }]
    let baseOptions = [];

    if (interactive && props.class == 'label' && schema && schema.nodes) {
        baseOptions = Object.keys(schema.nodes).map(n => { return { label: n, value: n } });
    }
    if (interactive && props.class == 'reltype' && schema && schema.relationships) {
        baseOptions = Object.keys(schema.relationships).map(n => { return { label: n, value: n } });
    }
    if (interactive && inFocus && props.class == 'variable' && variables) {
        // TODO this is some complex computation on every render, we shouldn't do that.
        const vars = constructComplexVariables(variables, schema);
        // @ts-ignore
        baseOptions = Object.values(vars).map(n => { return { label: n.text[0], value: n.text[0] } });
    }

    // Determine the color of the block's text. 
    let colorClass = 'black';
    let color = 'black';
    switch (props.class) {
        case 'label':
            color = '#cb4b16';
            colorClass = 'red-text';
            break;
        case 'reltype':
            color = '#cb4b16';
            colorClass = 'red-text';
            break;
        case 'variable':
            if (value?.includes && value?.includes('.')) {
                color = '#586e75';
                colorClass = 'grey-text';
            } else if (value !== undefined && !isNaN(value)) {
                color = '#2aa198';
                colorClass = 'green-text';
            } else if (value?.startsWith && (value?.startsWith('"') && value?.endsWith('"')) || value?.startsWith("'") && value?.endsWith("'")) {
                color = '#b58900';
                colorClass = 'orange-text';
            } else {
                color = '#268bd2';
                colorClass = 'blue-text';
            }
            break;
    }
    // If the element is not rendered interactively, it's a 'fake' selector. This is for optimization reasons.
    if (!interactive) {
        return <div style={{
            border: '1px solid lightgrey',
            borderRadius: '4px',
            paddingTop: '2px',
            paddingLeft: '7px',
            paddingRight: '3px',
            color: color,
            // paddingBottom: '24px',
            lineHeight: '22px',
            minHeight: '12px',
            opacity: '1 !important',
            background: '#fdfdfd',
            fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace',
            // marginRight: '-0px',
            // marginLeft: '0px',
            height: '28px',
            fontSize: '1 rem',
            textAlign: 'left',
            // maxWidth: '120px',
            maxWidth: '400px',
            whiteSpace: 'nowrap',
            overflow: 'clip',
            textOverflow: 'clip',
            // color: 'black'
        }}>
            {value ? renderValue(value) : '…'}
        </div>
    } else {

        // If it is interactive, render the normal selector.
        return <>
            <Select label={''} type={'select'} selectProps={{
                className: colorClass,
                options: !value ? baseOptions : deduplicateDictList([{ label: value, value: value }, ...baseOptions]),
                inputValue: inFocus ? renderValue(value) : undefined,
                value: renderValue(value),
                placeholder: renderValue(value) ? value : '…',
                // menuIsOpen: true,

                // Custom formatting to split and style 'm.name'
                formatOptionLabel: ({ label }) => {
                    if (label?.includes('.')) {
                        const [prefix, suffix] = label.split('.');
                        return (
                            <span>
                                <span style={{ color: color }}>{prefix}</span>
                                <span style={{ color: '#586e75' }}>{'.' + suffix}</span>
                            </span>
                        );
                    } else {
                        return label
                    }

                },

                onFocus: () => {
                    setInFocus(true);
                    props.setInFocus(true);
                },
                onInputChange: (newValue, { action }) => {
                    if (action === 'input-change') {
                        setValue(newValue);
                    }
                    if (action === 'set-value') {
                        setValue(value);
                    }
                },
                tabSelectsValue: false,
                tabIndex: -1,
                onChange: (value) => {
                    setValue(value.value)
                    setInFocus(false);
                    props.setInFocus(false);
                },
                onBlur: () => {
                    value && setValue(value);
                    setInFocus(false);
                    props.setInFocus(false);
                },
                classNames: {
                    input: () => {
                        return `${colorClass} ndl-input-container`
                    }
                },

                styles: {

                    input: (provided) => ({
                        ...provided,
                        marginRight: '-11px',
                        marginLeft: '-1px',
                        maxWidth: '400px',
                        // overflow: 'hidden',
                        content: '"' + value + '"',
                        textOverflow: 'ellipsis',
                    }),
                    control: (provided) => ({
                        ...provided,
                        fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace',
                        fontSize: 'var(--font-size-body-large)',
                        lineHeight: '18px',
                        minHeight: '12px',
                        opacity: '1 !important',
                        background: '#fdfdfd',
                        zIndex: 1
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
                        // color: '#cb4b16 !important',
                        marginRight: '-1px',
                        paddingLeft: 0,
                        paddingRight: 0,

                        maxWidth: '400px',
                        marginLeft: '-1px'
                    }),

                    menu: (provided) => ({
                        ...provided,
                        width: 'auto',
                        minWidth: '150px'
                    }),
                    option: (provided) => ({
                        ...provided,
                        fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace',

                    })
                }
            }} />
        </>;
    }


}
