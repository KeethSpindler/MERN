import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { getCurrentProfile } from '../../actions/profile';

const Dashboard = ({
  getCurrentProfile,
  auth: { user },
  profile: { profile, loading },
}) => {
  useEffect(() => {
    getCurrentProfile();
  }, []);
  return loading && profile === null ? (
    <Spinner />
  ) : (
    <Fragment>
      <h1 className='large text-primary'>Dashboard</h1>
      <p className='lead'>Dashboard</p>
      <i className='fas fa-user'></i> Welcome {user && user.name}
      {profile !== null ? (
        <Fragment>hasProfile</Fragment>
      ) : (
        <Fragment>
          <div className='container text-center'>
            <h2 className='my-3'>Woah There!</h2>
            <p className='lead'>
              You haven't made a profile yet. Please add some information so
              others can learn a little bit about you!
            </p>
            <Link to='/create-profile' className='btn btn-primary my-2'>
              Create Profile
            </Link>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  profile: state.profile,
});
export default connect(mapStateToProps, { getCurrentProfile })(Dashboard);
