import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import { toLower as lodashToLower } from 'lodash';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { onToggle } from '../modules/modal/actions';
import ErrorBoundary from './error-boundary';
import DetectOuterClick from '../components/util/detect-outer-click';
import Draggable from 'react-draggable';
import { ResizableBox, Resizable } from 'react-resizable';
const InteractionWrap = ({ condition, wrapper, children }) => condition ? wrapper(children) : children;
const toggleWithClose = (onToggle, onClose, isOpen) => {

  if (onClose && isOpen) {
    return () => {
      onToggle();
      onClose();
    }
  } else {
    return onToggle;
  }
};
class ModalContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: props.customProps.width,
      height: props.customProps.height,
      isDraggable: props.isDraggable
    };
    this.onResize = this.onResize.bind(this);
  }
  getStyle(state, props) {
    const isResizable = props.isResizable;
    return {
      left: props.offsetLeft,
      right: props.offsetRight,
      top: props.offsetTop,
      width: isResizable ? state.width : props.width,
      height: isResizable ? state.height : props.height
    };
  }
  onResize(e, { size }) {
    e.stopPropagation();
    this.setState({
      width: size.width, height: size.height
    });
  }
  getTemplateBody() {
    const { bodyTemplate } = this.props;
    return bodyTemplate.isLoading ? (
      <span> Loading </span>
    ) : (
        <div
          id="template-content"
          dangerouslySetInnerHTML={{ __html: bodyTemplate.response }}
        />
      );
  }
  setDimensions(updatedState) {
    this.setState(updatedState)
  }

  render() {
    const {
      isCustom,
      id,
      isOpen,
      isTemplateModal,
      customProps,
      isMobile,
      screenHeight
    } = this.props;
    // Populate props from custom obj
    const newProps =
      isCustom && id ? update(this.props, { $merge: customProps }) : this.props;
    const {
      onToggle,
      bodyText,
      bodyHeader,
      headerComponent,
      headerText,
      modalClassName,
      backdrop,
      autoFocus,
      type,
      wrapClassName,
      clickableBehindModal,
      bodyComponent,
      onClose,
      CompletelyCustomModal,
      bodyComponentProps,
      timeout,
      desktopOnly,
      size,
      isDraggable,
      isResizable
    } = newProps;

    const style = this.getStyle(this.state, newProps);
    const lowerCaseId = lodashToLower(id);
    const BodyComponent = bodyComponent || '';
    const allowOuterClick = !isOpen || type === 'selection' || clickableBehindModal;
    const modalWrapClass = clickableBehindModal ? `clickable-behind-modal ${wrapClassName}` : wrapClassName;

    const toggleFunction = toggleWithClose(onToggle, onClose, isOpen);
    if (isMobile && isOpen && desktopOnly) {
      toggleFunction();
    }
    return (
      <ErrorBoundary>
        <InteractionWrap
          condition={isDraggable || isResizable}
          wrapper={children =>
            <Draggable
              handle=".draggable-modal-content"
              disabled={!isDraggable}
            >
              <Resizable className="resize-box" resizeHandles={['se']}
                width={this.state.width || 500} height={this.state.height || 300} minConstraints={[250, 250]}
                maxConstraints={[495, screenHeight]}
                handleSize={[8, 8]}
                onResize={this.onResize}
                draggableOpts={{ disabled: !isResizable }}
              >
                {children}
              </Resizable>
            </Draggable>
          }

        >
          <Modal
            isOpen={isOpen}
            toggle={toggleFunction}
            backdrop={backdrop}
            id={lowerCaseId}
            size={size}
            className={isTemplateModal ? 'template-modal' : modalClassName || 'default-modal'}
            autoFocus={autoFocus || false}
            style={style}
            wrapClassName={modalWrapClass + ' ' + lowerCaseId}
            modalTransition={{ timeout: isDraggable ? 0 : timeout || 100 }}
            fade={!isDraggable}
          >
            {CompletelyCustomModal
              ? (<CompletelyCustomModal key={'custom_' + lowerCaseId} setDimensions={this.setDimensions.bind(this)} height={this.state.height} width={this.state.width} {...customProps}
                toggleWithClose={toggleFunction} />)
              : (
                <DetectOuterClick
                  onClick={toggleFunction}
                  disabled={allowOuterClick}
                >
                  {(headerComponent || headerText) && (
                    <ModalHeader toggle={toggleFunction}>
                      {headerComponent ? <headerComponent /> : headerText || ''}
                    </ModalHeader>
                  )}
                  <ModalBody>
                    {bodyHeader && <h3>{bodyHeader}</h3>}
                    {BodyComponent
                      ? (
                        <BodyComponent {...bodyComponentProps}
                          screenHeight={screenHeight}
                          closeModal={toggleFunction} />
                      )
                      : isTemplateModal ? this.getTemplateBody() : bodyText || ''}
                  </ModalBody>
                </DetectOuterClick>
              )}
          </Modal>
        </InteractionWrap >
      </ErrorBoundary >
    );
  }
}

function mapStateToProps(state) {
  const {
    bodyText,
    headerText,
    isCustom,
    id,
    isOpen,
    template,
    customProps
  } = state.modal;
  let bodyTemplate;
  let isTemplateModal = false;
  if (template) {
    bodyTemplate = state[template];
    isTemplateModal = true;
  }
  const isMobile = state.browser.lessThan.medium;

  return {
    isOpen: isOpen,
    bodyText,
    headerText,
    isCustom,
    id,
    isMobile,
    screenHeight: isMobile ? undefined : state.browser.screenHeight,
    screenWidth: isMobile ? undefined : state.browser.screenWidth,
    bodyTemplate,
    isTemplateModal,
    customProps
  };
}
const mapDispatchToProps = dispatch => ({
  onToggle: () => {
    dispatch(onToggle());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalContainer);
ModalContainer.defaultProps = {
  customProps: {}
};
ModalContainer.propTypes = {
  bodyTemplate: PropTypes.object,
  customProps: PropTypes.object,
  id: PropTypes.string,
  isCustom: PropTypes.bool,
  isDraggable: PropTypes.bool,
  isMobile: PropTypes.bool,
  isOpen: PropTypes.bool,
  isTemplateModal: PropTypes.bool
};
