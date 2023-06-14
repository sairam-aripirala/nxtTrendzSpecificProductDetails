import {Component} from 'react'

import {BsDashSquare, BsPlusSquare} from 'react-icons/bs'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import Header from '../Header'

import './index.css'

const statusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class ProductItemDetails extends Component {
  constructor() {
    super()

    this.state = {
      productDetails: {},
      status: statusConstants.initial,
      itemCount: 1,
    }
  }

  componentDidMount() {
    this.getProductDetails()
  }

  componentDidUpdate(prevProps) {
    const {match} = this.props
    const {params} = match
    const {id} = params
    console.log('updated')

    if (prevProps.match.params.id !== id) {
      console.log('id changed and called getProducts')
      this.getProductDetails()
    }
  }

  onRedirectToProducts = () => {
    const {history} = this.props
    history.replace('/products')
  }

  onIncreseCount = () => {
    this.setState(prev => ({itemCount: prev.itemCount + 1}))
  }

  onDecreseCount = () => {
    const {itemCount} = this.state
    if (itemCount > 1) {
      this.setState(prev => ({itemCount: prev.itemCount - 1}))
    }
  }

  getProductDetails = async () => {
    this.setState({status: statusConstants.inProgress})
    const {match} = this.props
    const {id} = match.params
    // console.log(id)

    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/products/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(url, options)

    const data = await response.json()
    // console.log(data)
    const updatedData = {
      id: data.id,
      availability: data.availability,
      brand: data.brand,
      description: data.description,
      imageUrl: data.image_url,
      price: data.price,
      rating: data.rating,
      similarProducts: data.similar_products,
      style: data.style,
      title: data.title,
      reviews: data.total_reviews,
    }
    if (response.ok === true) {
      this.setState({
        status: statusConstants.success,
        productDetails: updatedData,
      })
    } else {
      this.setState({status: statusConstants.failure})
    }
  }

  renderFailureView = () => (
    <div className="failure-view-bg">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="failure-view-image"
      />
      <h1 className="failure-view-heading">Product Not Found</h1>
      <button
        className="continue-shopping-btn"
        type="button"
        onClick={this.onRedirectToProducts}
      >
        Continue Shopping
      </button>
    </div>
  )

  renderLoader = () => (
    <div data-testid="loader" className="loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderProductDetails = () => {
    const {productDetails, itemCount} = this.state
    const {
      title,
      imageUrl,
      brand,
      availability,
      description,
      price,
      rating,
      similarProducts,

      reviews,
    } = productDetails
    console.log(productDetails)
    return (
      <>
        <div className="product-details-container">
          <img src={imageUrl} alt="product" className="main-product-image" />
          <div className="product-details-text-container">
            <h1 className="item-title">{title}</h1>
            <p className="item-price">Rs {price}/-</p>
            <p className="rating-and-review-para">
              <p className="item-rating">
                {rating}
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star-image-1"
                />
              </p>
              <p className="item-reviews">{reviews} Reviews</p>
            </p>
            <p className="item-description">{description}</p>
            <p className="item-availability">
              <span className="availability-text">Available: </span>{' '}
              {availability}
            </p>
            <p className="item-availability">
              <span className="availability-text">Brand: </span> {brand}
            </p>
            <hr className="details-separation-line" />
            <div className="product-count-container">
              <button
                className="increase-decrese-btn"
                type="button"
                onClick={this.onDecreseCount}
                data-testid="minus"
              >
                <BsDashSquare />
              </button>
              <p className="product-count">{itemCount}</p>
              <button
                className="increase-decrese-btn"
                type="button"
                onClick={this.onIncreseCount}
                data-testid="plus"
              >
                <BsPlusSquare />
              </button>
            </div>
            <button className="add-to-cart-btn" type="button">
              ADD TO CART
            </button>
          </div>
        </div>
        <div className="similar-products-container">
          <h1 className="similar-products-heading">Similar Products</h1>
          <ul className="similar-products-list-container">
            {similarProducts.map(each => {
              const changeToProduct = () => {
                const {history} = this.props
                history.push(`/products/${each.id}`)
                this.setState(
                  {
                    productDetails: {},
                    status: statusConstants.initial,
                    itemCount: 1,
                  },
                  this.getProductDetails,
                )
              }
              return (
                <li
                  className="similar-item-card-container"
                  onClick={changeToProduct}
                  key={each.id}
                >
                  <img
                    src={each.image_url}
                    alt={`similar product ${each.title}`}
                    className="similar-item-card-image"
                  />
                  <p className="similar-card-title">{each.title}</p>
                  <p className="similar-card-brand">by: {each.brand}</p>
                  <div className="price-rating-container-similar-card">
                    <p className="similar-card-price">Rs {each.price}/-</p>
                    <p className="similar-card-rating">
                      {each.rating}
                      <img
                        src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                        alt="star"
                        className="star-image"
                      />
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </>
    )
  }

  render() {
    const {status} = this.state
    let element
    switch (status) {
      case statusConstants.success:
        element = this.renderProductDetails()
        break
      case statusConstants.failure:
        element = this.renderFailureView()
        break
      case statusConstants.inProgress:
        element = this.renderLoader()
        break
      default:
        element = null
        break
    }

    return (
      <div className="product-details-bg-container">
        <Header />
        {element}
      </div>
    )
  }
}

export default ProductItemDetails
