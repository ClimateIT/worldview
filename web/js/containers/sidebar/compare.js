import React from 'react';
import PropTypes from 'prop-types';
import Layers from './layers';
import { getLayers } from '../../modules/layers/selectors';
import { toggleActiveCompareState } from '../../modules/compare/actions';
import util from '../../util/util';
import { connect } from 'react-redux';

import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
const tabHeight = 32;
class CompareCase extends React.Component {
  render() {
    const {
      isActive,
      dateStringA,
      dateStringB,
      toggleActiveCompareState,
      isCompareA,
      height,
      layersA,
      layersB
    } = this.props;
    const outerClass = 'layer-container sidebar-panel';
    const tabClasses = 'ab-tab';
    return (
      <div className={isActive ? '' : 'hidden '}>
        <div className={outerClass}>
          <div className="ab-tabs-case">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={
                    isCompareA
                      ? tabClasses + ' first-tab active'
                      : tabClasses + ' first-tab'
                  }
                  onClick={toggleActiveCompareState}
                >
                  <i className="productsIcon selected icon-layers" />
                  {' A: ' + dateStringA}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={
                    !isCompareA
                      ? tabClasses + ' second-tab active'
                      : tabClasses + ' second-tab'
                  }
                  onClick={toggleActiveCompareState}
                >
                  <i className="productsIcon selected icon-layers" />
                  {' B: ' + dateStringB}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={isCompareA ? '1' : '2'}>
              <TabPane tabId="1">
                <Layers
                  isActive={isCompareA}
                  activeOverlays={layersA}
                  layerGroupName="active"
                  height={height - tabHeight}
                />
              </TabPane>
              <TabPane tabId="2">
                <Layers
                  isActive={!isCompareA}
                  activeOverlays={layersB}
                  layerGroupName="activeB"
                  height={height - tabHeight}
                />
              </TabPane>
            </TabContent>
          </div>
        </div>
      </div>
    );
  }
}
const mapDispatchToProps = dispatch => ({
  toggleActiveCompareState: () => {
    dispatch(toggleActiveCompareState());
  }
});
function mapStateToProps(state, ownProps) {
  const { layers, compare, legacy } = state;
  return {
    isCompareA: compare.isCompareA,
    layersA: getLayers(layers.active, { group: 'all', proj: 'all' }, state),
    layersB: getLayers(layers.activeB, { group: 'all', proj: 'all' }, state),
    dateStringA: util.toISOStringDate(legacy.date.selected),
    dateStringB: util.toISOStringDate(legacy.date.selectedB),
    isActive: compare.active,
    height: ownProps.height
  };
}
CompareCase.propTypes = {
  isActive: PropTypes.bool,
  dateStringA: PropTypes.string,
  dateStringB: PropTypes.string,
  toggleActiveCompareState: PropTypes.func,
  isCompareA: PropTypes.bool,
  height: PropTypes.number,
  layersA: PropTypes.object,
  layersB: PropTypes.object
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompareCase);
