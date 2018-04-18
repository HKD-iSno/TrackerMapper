import _ from 'lodash';
import Immutable from 'immutable';
import ActionTypes from '../ActionTypes';

const {
  DATA_IMPORTED,
  TRAIL_ADDED,
  TRAIL_MODIFIED,
  TRAIL_SELECTED,
  TRAIL_DELETED,
} = ActionTypes;

const initialState = {
  trails: Immutable.Map(),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TRAIL_ADDED: {
      const { trails } = state;
      const trail = action.data;
      const newTrails = trails.set(trail.get('id'), trail);
      return {
        ...state,
        trails: newTrails,
      };
    }
    case TRAIL_SELECTED: {
      // this is actually bad because state shouldnt cause side effects
      // but this map stuff is a little wack
      const { prevSelected, selected } = action.data;
      if (prevSelected && state.trails.get(prevSelected)) {
        const features = state.trails.getIn([prevSelected, 'features']);
        _.each(features, (f) => {
          f.unset('selected');
          f.changed();
        });
      }
      if (selected && state.trails.get(selected)) {
        const features = state.trails.getIn([selected, 'features']);
        _.each(features, (f) => {
          f.set('selected', true);
          f.changed();
        });
      }
      return state;
    }
    case TRAIL_DELETED: {
      const trailId = action.data;
      const newTrails = state.trails.delete(trailId);
      return {
        ...state,
        trails: newTrails,
      };
    }
    case TRAIL_MODIFIED: {
      const { id, editedFields } = action.data;
      const newTrail = state.trails.get(id)
        .withMutations((tr) => {
          _.each(editedFields, (val, key) => tr.set(key, val));
        });
      newTrail.get('feature').setProperties(editedFields);
      newTrail.get('feature').changed();
      return {
        ...state,
        trails: state.trails.set(id, newTrail),
      };
    }
    case DATA_IMPORTED: {
      const { trails } = action.data;
      return {
        ...state,
        trails: state.trails.merge(trails),
      };
    }
    default:
      return state;
  }
};