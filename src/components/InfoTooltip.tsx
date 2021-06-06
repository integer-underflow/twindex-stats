import { OverlayTrigger, Tooltip } from 'react-bootstrap'
interface Props {
  placement?: 'top' | 'right' | 'bottom' | 'left'
  text: string
}
const InfoTooltip = ({ placement = 'top', text }: Props) => {
  return (
    <OverlayTrigger placement={placement} overlay={<Tooltip id={`tooltip-${placement}`}>{text}</Tooltip>}>
      <i className="fa fa-info-circle" />
    </OverlayTrigger>
  )
}

export default InfoTooltip
