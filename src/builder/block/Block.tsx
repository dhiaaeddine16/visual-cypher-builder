
import { Tag, Tooltip } from "@neo4j-ndl/react";
import { BlockSelect } from "./components/BlockSelect";
import { BlockType } from "./BlockType";
import { BlockOption } from "./components/BlockOption";
import { useState } from "react";

/**
 * The main component for rendering a query block.
 *
 * A query block is a collection of components that are laid out horizontally.
 * Components can be interactive (selectors) or static (text spans).
 * The list components are determined by the `BlockType` of the element.
 *
 * @param {object} props - The component props.
 * @param {any} props.id - The id of the query block.
 * @param {boolean} props.interactive - Whether the component is interactive.
 * @param {boolean} props.hasTooltip - Whether the component should render a tooltip.
 * @param {object} props.schema - The schema of the query block.
 * @param {object} props.variables - The variables of the query block.
 * @param {object} props.element - The element of the query block.
 * @param {function} props.setElement - The function to call when the element changes.
 * @param {function} props.setInFocus - The function to call when the component is focused.
 * @param {boolean} props.selected - Whether the component is selected.
 * @param {boolean} props.dragging - Whether the component is being dragged.
 * @param {boolean} props.dropped - Whether the component has been dropped.
 * @returns {ReactElement} - The rendered component.
 */
export function BlockComponent(props: { id: any; interactive: boolean, hasTooltip: boolean, schema: any, variables: any, element: any, setElement: any, setInFocus: any }) {
  const { id, interactive, schema, variables, element, setElement, setInFocus, hasTooltip } = props;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);


  /**
   * A function that is called when the user selects a new value for a part of the query block.
   * For relationships - If the new value is '<-' or '->', it will convert any existing '-' or '<-' or '->' in the text array to '-'.
   * @param {number} index - The index of the part of the query block that was changed.
   * @param {string} newValue - The new value of the changed part of the query block.
   */
  const setValue = (index: number, newValue: string) => {
    const newElement = { ...element };
    newElement.text = [...element.text];

    // Case for handling inverted relationship directions
    if (newValue == '<-') {
      const invertableDirection = newElement.text.findIndex((item: any) => item === '->');
      if (invertableDirection !== -1) {
        newElement.text[invertableDirection] = '-';
      }
    }
    // Case for handling inverted relationship directions
    if (newValue == '->') {
      const invertableDirection = newElement.text.findIndex((item: any) => item === '<-');
      if (invertableDirection !== -1) {
        newElement.text[invertableDirection] = '-';
      }
    }

    newElement.text[index] = newValue;
    setElement(newElement);
  }

  // Determine the color of the block's text. 
  let color = 'black';
  switch (element?.type) {
    case 'CLAUSE':
      color = '#718500';
      break;

    case 'OPERATOR':
      color = '#718500';
      break;
    case 'FUNCTION':
      color = '#6c71c4';
      break;
    case 'TRANSFORMER':
      color = '#718500';
      break;
    case 'PATTERN':
      color = '#657b83';
      break;
    default:
      color = 'black';
  }
  const style = {
    width: "auto",
    display: "inline-block",
    background: "white !important",
    position: 'relative',
    fontSize: "auto",
    alignItems: "center",
    color: color,
    justifyContent: "center",
    textAlign: "left !important",
    cursor: "pointer",
    marginLeft: "0px",
    marginTop: "0px",
    marginBottom: "0px",
    columnGap: "2px !important"
  };

  const type = element?.type;
  const components = BlockType[type]?.components || [];
  const marginHorizontal = type?.includes('COMPARISON') ? '1px' : undefined;


  /**
   * When the user hovers over a block, this function sets a timeout
   * to open the tooltip after a short delay. This is to prevent
   * accidental tooltip triggers.
   * 
   * @param {React.MouseEvent} event
   */
  const handleMouseOver = () => {
    const timeout = setTimeout(() => setTooltipOpen(true), 15000); // Delay of 1500ms
    setHoverTimeout(timeout);
  };


  /**
   * Handle mouse out event.
   * 
   * This function is called when the user moves their mouse out of the block.
   * It clears the timeout set by `handleMouseOver` and ensures that the
   * tooltip does not open if the hover ends early.
   */
  const handleMouseOut = () => {
    clearTimeout(hoverTimeout); // Clear timeout to prevent tooltip from opening if hover ends early
    setTooltipOpen(false); // Ensure tooltip closes immediately on mouse out
  };

  const component = <Tag size={'large'}>
    <div style={{ columnGap: "2px !important", display: 'flex', marginLeft: '-6px', marginRight: '-6px' }}>

      {components.length == 0 ? <span style={{ marginLeft: 2, marginRight: 2, lineHeight: '27px', fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace', background: 'white', color: 'green', fontWeight: 'bold' }}>{'???'}</span> : ''}
      {components.map((component: { type: string; text: any; class: any }, i: number) => {
        if (component.type === 'fixed' || component.type === 'name') {
          return <span style={{ marginLeft: 2, marginRight: 2, lineHeight: '27px', fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace' }}>{element.text[i] ? element.text[i] : '???'}</span>;
        } else if (component.type === 'option') {
          // @ts-ignore
          return <BlockOption setInFocus={setInFocus} style={{ marginLeft: marginHorizontal, marginRight: marginHorizontal, border: '1px dashed #eee' }} options={component.options} value={element.text[i]} setValue={(value) => setValue(i, value)} interactive={interactive} />;
        } else if (component.type === 'select') {
          return <BlockSelect class={component.class} schema={schema} variables={variables} setInFocus={setInFocus} value={element.text[i]} setValue={(value) => setValue(i, value)} interactive={interactive} />;
        } else {
          return <span style={{ marginLeft: 2, marginRight: 2, lineHeight: '27px', fontFamily: 'Fira Code, Menlo, Monaco, Lucida Console, monospace' }}>???</span>;
        }
      })}
    </div>
  </Tag>;

  const tooltip = <Tooltip.Content>
    <Tooltip.Header>Query Block</Tooltip.Header>
    <Tooltip.Body>
      This is a useless tooltip, but it could be useful!
    </Tooltip.Body>
  </Tooltip.Content>;

  return (
    <div id={"item-" + id}
      // @ts-ignore
      style={style}
      onMouseOut={handleMouseOut} onMouseOver={handleMouseOver} onMouseLeave={handleMouseOut} onBlur={handleMouseOut}>
      {hasTooltip ?
        <Tooltip type="rich" isOpen={tooltipOpen}>
          <Tooltip.Trigger>
            {component}
          </Tooltip.Trigger>
          {tooltip}
        </Tooltip>
        :
        component
      }
    </div>
  );
}
