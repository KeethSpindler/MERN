import axios from 'axios';
import { setAlert } from './alert';
import { GET_POSTS, POST_ERROR, UPDATE_LIKES, DELETE_POST, ADD_POST, ADD_COMMENT, DELETE_COMMENT, GET_POST } from './types';

//Get Posts
export const getPosts = () => async (dispatch) => {
  try {
    const res = await axios.get('api/post');

    dispatch({
      type: GET_POSTS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};

//Add Like
export const addLike = (postId) => async (dispatch) => {
  try {
    const res = await axios.put(`api/post/like/${postId}`);

    dispatch({
      type: UPDATE_LIKES,
      payload: {postId, likes: res.data},
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};

//Remove Like
export const removeLike = (postId) => async (dispatch) => {
  try {
    const res = await axios.put(`api/post/unlike/${postId}`);

    dispatch({
      type: UPDATE_LIKES,
      payload: {postId, likes: res.data},
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};

//Delete Post
export const deletePost = (postId) => async (dispatch) => {
  try {
    await axios.delete(`api/post/${postId}`);

    dispatch({
      type: DELETE_POST,
      payload: postId,
    });
    dispatch(setAlert('Post Removed', 'success'));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};

//Add Post
export const addPost = (formData) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  try {
    const res = await axios.post('api/post/', formData, config);

    dispatch({
      type: ADD_POST,
      payload: res.data,
    });
    dispatch(setAlert('Post Created', 'success'));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};

//Get Post
export const getPost = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/post/${id}`);
    dispatch({
      type: GET_POST,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};

//Add Comment
export const addComment = (postId, formData) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  try {
    console.log(postId +'\n' + formData)
    const res = await axios.post(`/api/post/comment/${postId}`, formData, config);

    dispatch({
      type: ADD_COMMENT,
      payload: res.data,
    });
    dispatch(setAlert('Comment Created', 'success'));
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};

//Delete Comment
export const deleteComment = (postId, commentId) => async (dispatch) => {
  try {
    await axios.put(`/api/post/comment/${postId}/${commentId}`);

    dispatch({
      type: DELETE_COMMENT,
      payload: commentId,
    });
    dispatch(setAlert('Comment Deleted', 'success'));

  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, statrus: err.response.status },
    });
  }
};