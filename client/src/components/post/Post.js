import React, { Fragment, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getPost } from '../../actions/post';
import Spinner from '../layout/Spinner'
import PostItem from '../posts/PostItem'
import CommentForm from '../post/CommentForm'

const Post= ({ getPost, post: { post, loading }, match}) => {
    useEffect(() => {
        getPost(match.params.id);
    }, [getPost, match.params.id])
        return loading || post == null ? <Spinner/> : 
        <Fragment>
            <Link to='/posts' className='btn'/>
            <PostItem post = {post} showActions={false}/>
            <CommentForm postId={post._id}/>
        </Fragment>
        
    }

Post.propTypes = {
    getPost: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    post: state.post
})

export default connect(mapStateToProps, {getPost})(Post);
