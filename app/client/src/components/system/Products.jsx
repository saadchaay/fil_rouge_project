import { useState, useEffect, Fragment, useRef } from "react";
import axios from "../../api/axios";
import { Delete, SkipNextOutlined } from "@material-ui/icons";
import { Dialog, Transition } from "@headlessui/react";
import Switch from "@material-ui/core/Switch";
import Drop from "../helpers/Drop";
import { Link } from "react-router-dom";
import Axios from "axios";
import { Image } from "cloudinary-react";

const statusStyles = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  processing: "bg-yellow-100 text-yellow-800",
  failed: "bg-gray-100 text-gray-800",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const [checked, setChecked] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imgPrv, setImgPrv] = useState(null);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [products, setProducts] = useState([]);
  // product data::
  const [avatar, setAvatar] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");

  const [errors, setErrors] = useState({});

  const closeModal = () => {
    setTitle("");
    setDescription("");
    setQuantity("");
    setPrice("");
    setCategory("");
    setAvatar("");
    setOpen(false);
    setImgPrv(null);
    setErrors({});
  };
  // handle image preview
  const handleImageChange = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      setImgPrv(reader.result);
      setAvatar(file.name);
    };
    reader.readAsDataURL(file);
  };

  // handle change select input
  const [colorsSelected, setColorsSelected] = useState(null);
  const [sizesSelected, setSizesSelected] = useState(null);

  const handleChangeColors = (selected) => {
    setColorsSelected(selected);
  };
  const handleChangeSizes = (selected) => {
    setSizesSelected(selected);
  };

  // fetch all products
  const fetchProducts = async () => {
    const type = "admin";
    const id = auth.role === "admin" ? auth.id : auth.id_admin;
    const res = await axios.get("ProductsController/index/" + id + "/" + type);
    if (res.data) {
      console.log(res.data);
      setProducts(res.data.data);
      if (res.data.data.length > 0) {
        setChecked(res.data.data.map((item) => item.status));
      }
      setCategories(res.data.categories);
      setColors(res.data.properties.colors);
      setSizes(res.data.properties.sizes);
    } else {
      console.log("There's no product");
    }
  };

  // add product
  const handleProduct = async (e) => {
    // add modal here.........
    e.preventDefault();
    const newErrors = {};
    if (title === "") {
      newErrors.title = "Title is required";
    }
    if (description === "") {
      newErrors.description = "Description is required";
    }
    if (quantity === "") {
      newErrors.quantity = "Quantity is required";
    }
    if (price === "") {
      newErrors.price = "Price is required";
    }
    if (sku === "") {
      newErrors.sku = "SKU is required";
    }
    if (category === "") {
      newErrors.category = "Category is required";
    }
    if (avatar === "") {
      newErrors.avatar = "Avatar is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData();
      formData.append("file", imgPrv);
      formData.append("upload_preset", "product");
      const response = await Axios.post(
        "https://api.cloudinary.com/v1_1/maggie-7223/image/upload",
        formData
      );
      console.log(response);

      if (response.status === 200) {
        const product = {
          creator: auth.id,
          type: auth.role === "admin" ? "admin" : "user",
          avatar: response.data.public_id,
          title: title,
          description: description,
          quantity: quantity,
          price: price,
          sku: sku,
          category: category,
          color: colorsSelected,
          size: sizesSelected,
        };
        const res = await axios.post(
          "ProductsController/store",
          JSON.stringify(product),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (res.status === 201) {
          fetchProducts();
          setOpen(false);
          setTitle("");
          setDescription("");
          setQuantity("");
          setPrice("");
          setSku("");
          setCategory("");
          setAvatar("");
          setColorsSelected(null);
          setSizesSelected(null);
          setImgPrv(null);
          setErrors({});
          console.log("Product added");
        } else {
          console.log("Error");
          console.log(res);
          if (res.data.title) {
            setErrors({ ...errors, title: res.data.title });
          }
          if (res.data.description) {
            setErrors({
              ...errors,
              title: res.data.title,
              description: res.data.description,
            });
          }
          if (res.data.quantity) {
            setErrors({
              ...errors,
              title: res.data.title,
              description: res.data.description,
              quantity: res.data.quantity,
            });
          }
          if (res.data.price) {
            setErrors({
              ...errors,
              title: res.data.title,
              description: res.data.description,
              quantity: res.data.quantity,
              price: res.data.price,
            });
          }
          if (res.data.category) {
            setErrors({
              ...errors,
              title: res.data.title,
              description: res.data.description,
              quantity: res.data.quantity,
              price: res.data.price,
              category: res.data.category,
            });
          }
          if (res.data.sku) {
            setErrors({
              ...errors,
              title: res.data.title,
              description: res.data.description,
              quantity: res.data.quantity,
              price: res.data.price,
              category: res.data.category,
              sku: res.data.sku,
            });
          }
        }
      }
    }
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    axios.delete("ProductsController/delete/" + id).then((res) => {
      if (res.status === 201) {
        console.log("Product deleted");
        fetchProducts();
      } else {
        console.log("Error");
        console.log(res);
      }
    });
  };

  // handle change
  const handleChange = async (index) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);

    const newProducts = products.map((product, i) => {
      if (i === index) {
        product.status = newChecked[index] ? true : false;
      }
      return product;
    });
    setProducts(newProducts);
    const id = newProducts[index].id;
    const res = await axios.put("ProductsController/changeStatus/" + id, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.data.status === "success") {
      console.log(res.data.status);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 mb-3 overflow-y-auto">
            <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
              <form onSubmit={handleProduct}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative bg-gray-100 rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full">
                    {/* <form onSubmit={handleProduct}> */}
                    <div className="sm:mt-0 px-4 py-5">
                      <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:mt-0 md:col-span-2">
                          <div className="shadow overflow-hidden rounded-md">
                            <div className="px-4 py-5 bg-white sm:p-6">
                              <h3 className="text-lg font-medium leading-6 text-gray-900 pb-3">
                                Product Information
                              </h3>
                              <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                  <label
                                    htmlFor="first-name"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Product name
                                  </label>
                                  <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    autoComplete="title"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                  />
                                  <div className="text-red-500 mb-3 text-sm">
                                    {open
                                      ? errors.title
                                        ? errors.title
                                        : null
                                      : null}
                                  </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                  <label
                                    htmlFor="last-name"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Category
                                  </label>
                                  <select
                                    id="role"
                                    value={category}
                                    onChange={(e) =>
                                      setCategory(e.target.value)
                                    }
                                    autoComplete="country-name"
                                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                  >
                                    <option value="">
                                      Choose category ...
                                    </option>
                                    {categories.map((category) => (
                                      <option
                                        key={category.id}
                                        value={category.id}
                                      >
                                        {category.title}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="text-red-500 mb-3 text-sm">
                                    {errors.category ? errors.category : null}
                                  </div>
                                </div>

                                <div className="col-span-6 sm:col-span-6">
                                  <label
                                    htmlFor="email-address"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Description
                                  </label>
                                  <textarea
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                      setDescription(e.target.value)
                                    }
                                    autoComplete="description"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                  />
                                  <div className="text-red-500 mb-3 text-sm">
                                    {errors.description
                                      ? errors.description
                                      : null}
                                  </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                  <label
                                    htmlFor="country"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Quantity
                                  </label>
                                  <input
                                    type="text"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) =>
                                      setQuantity(e.target.value)
                                    }
                                    autoComplete="quantity"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                  />
                                  <div className="text-red-500 mb-3 text-sm">
                                    {errors.quantity ? errors.quantity : null}
                                  </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                  <label
                                    htmlFor="country"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Price
                                  </label>
                                  <input
                                    type="text"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    autoComplete="price"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                  />
                                  <div className="text-red-500 mb-3 text-sm">
                                    {errors.price ? errors.price : null}
                                  </div>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                  <label
                                    htmlFor="country"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    SKU (Stock Keeping Unit)
                                  </label>
                                  <input
                                    type="text"
                                    id="sku"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    autoComplete="sku"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                                  />
                                  <div className="text-red-500 mb-3 text-sm">
                                    {errors.sku ? errors.sku : null}
                                  </div>
                                </div>

                                <div className="col-span-6 sm:col-span-6">
                                  <label
                                    htmlFor="country"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    <span className="flex justify-between">
                                      <span>Product image</span>
                                      {imgPrv ? (
                                        <button
                                          type="button"
                                          onClick={() => setImgPrv(false)}
                                          className="text-red-700 hover:text-red-900"
                                        >
                                          <Delete />
                                        </button>
                                      ) : null}
                                    </span>
                                  </label>
                                  {imgPrv ? (
                                    <img
                                      src={imgPrv}
                                      alt="preview"
                                      className="w-max-90 h-40 object-cover"
                                    />
                                  ) : (
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                      <div className="space-y-1 text-center">
                                        <svg
                                          className="mx-auto h-8 w-8 text-gray-400"
                                          stroke="currentColor"
                                          fill="none"
                                          viewBox="0 0 48 48"
                                          aria-hidden="true"
                                        >
                                          <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                          <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                          >
                                            <span>Upload a file</span>
                                            <input
                                              id="file-upload"
                                              name="file-upload"
                                              type="file"
                                              className="sr-only"
                                              onChange={(e) =>
                                                handleImageChange(e)
                                              }
                                            />
                                          </label>
                                          <p className="pl-1">
                                            or drag and drop
                                          </p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          PNG, JPG, GIF up to 10MB
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="text-red-500 mb-3 text-sm">
                                    {errors.avatar ? errors.avatar : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 md:col-span-1 sm:mt-0">
                          <div className="shadow rounded-md">
                            <div className="px-4 bg-white py-3 sm:px-3">
                              <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Product properties
                              </h3>

                              <div className="mt-4 grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-6">
                                  <label
                                    htmlFor="first-name"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Colors
                                  </label>
                                  <Drop
                                    data={colors}
                                    handleChangeSelected={handleChangeColors}
                                    selectData={colorsSelected}
                                  />
                                </div>

                                <div className="col-span-6 sm:col-span-6">
                                  <label
                                    htmlFor="email-address"
                                    className="block text-sm font-medium text-gray-700"
                                  >
                                    Sisez
                                  </label>
                                  <Drop
                                    data={sizes}
                                    handleChangeSelected={handleChangeSizes}
                                    selectData={sizesSelected}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                              type="submit"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              Submit
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                              onClick={() => closeModal()}
                              ref={cancelButtonRef}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* </form> */}
                  </Dialog.Panel>
                </Transition.Child>
              </form>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the Products in your account including their name of
              product, description and date of created product.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setOpen(true)}
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Product
            </button>
          </div>
        </div>
        <div className="-mx-4 mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
          <form>
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                  >
                    SKU product
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                  >
                    Product name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-3 text-sm font-semibold text-gray-900"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.length > 0 ? (
                  products.map((item, index) => (
                    <tr key={item.id}>
                      <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                        <Link to={`/product/${item.id}`}>
                          {" "}
                          <span className="text-cyan-600 font-bold">
                            {item.sku}
                          </span>{" "}
                        </Link>
                        <dl className="font-normal lg:hidden">
                          <dt className="sr-only">Category</dt>
                          <dd className="mt-1 truncate text-gray-700">
                            {categories.find(
                              (category) => category.id === item.id_category
                            ).title
                              ? categories.find(
                                  (category) => category.id === item.id_category
                                ).title
                              : ""}
                          </dd>
                          <dt className="sr-only sm:hidden">Product name</dt>
                          <dd className="mt-1 truncate text-gray-500 sm:hidden">
                            {item.title}
                          </dd>
                        </dl>
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                        {categories.find(
                          (category) => category.id === item.id_category
                        ).title
                          ? categories.find(
                              (category) => category.id === item.id_category
                            ).title
                          : ""}
                      </td>
                      <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                        <div className="flex justify-start items-center">
                          {item.avatar ? (
                            <Image
                              className="h-8 w-8 rounded-full"
                              cloudName="maggie-7223"
                              public_id={item.avatar}
                            />
                          ) : (
                            <img
                              className="h-8 w-8 rounded-full"
                              src="http://cdn.onlinewebfonts.com/svg/img_231353.png"
                              alt=""
                            />
                          )}
                          <span className="ml-1">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <span
                          className={classNames(
                            item.status
                              ? statusStyles["active"]
                              : statusStyles["inactive"],
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                          )}
                        >
                          {item.status ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {item.price}
                      </td>
                      <td className="py-4 pr-4 text-right text-sm font-medium sm:pr-6">
                        <span>
                          <Switch
                            checked={checked[index]}
                            onChange={() => handleChange(index)}
                            color="primary"
                            name="checkedB"
                            inputProps={{ "aria-label": "primary checkbox" }}
                          />
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="text-red-700 hover:text-red-900"
                          >
                            <Delete />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="flex justify-center py-3">
                        <div className="text-gray-500">No product found</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </form>
        </div>
      </div>
    </>
  );
}
