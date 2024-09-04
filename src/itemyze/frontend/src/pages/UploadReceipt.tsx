import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import axios from 'axios';

import '../styles/UploadReceipt.scss';

function UploadReceipt() {
  const [groups, setGroups] = useState<Dict[]>([]);
  const [items, setItems] = useState<Dict[]>([]);
  const [total, setTotal] = useState<number>(-1);
  let currency: string = "£";
  
  useEffect(() => {
    axios
      .get('/api/get_groups')
      .then(res => setGroups(res.data.groups));
  }, []);

  type Inputs = {
    group: string,
    receipt: FileList,
  };

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = data => console.log(data);
  
  return (
    <div className="content">
      <form id="upload-form" onSubmit={ handleSubmit(onSubmit) }>
        <label className="form-item required">Splitwise Group</label>
        <select 
          className="form-item"
          defaultValue=""
          { ...register("group", { required: true })}
        >
          <option value="" disabled>Please select a group</option>
          { groups.map(group => (
            <option key={ group.id } value={ group.id }>{ group.name }</option>
          ))}
        </select>
        <label className="form-item required">Upload Receipt</label>
        <input 
          className="form-item" 
          type="file"
          { ...register("receipt", { required: true })}
          onChange={ (e) => { 
            if(e.target.files) {
              sendReceiptData(e.target.files[0], currency)
                .then(res => {
                  setItems(res.items);
                  setTotal(res.total);
              });
            }
          }}
        />
        {(errors.group || errors.receipt) && <span id="validation-msg">
          Please check the required fields
        </span>}
        <button className="form-item">Submit</button>
      </form>
      { (items !== undefined && items.length != 0) && 
        <div id="receipt-items">
          <h3>Preview</h3>
          <table>
            <tbody>
              <tr>
                <th>Item Name</th>
                <th>Cost</th>
              </tr>
              { items.map(item => (
                <tr>
                  <td>{ item.name }</td>
                  <td>{ currency + item.cost }</td>
                </tr>
              ))}
              <tr>
                <td>
                  <span className="total-text">Total</span>
                </td>
                <td>
                  <span className="total-text">
                    { total !== undefined && currency + total }
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      }
    </div>
  );
}

async function sendReceiptData(file: File, currency: string) {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("currency", currency);
/*
  const csrftoken = Cookies.get('csrftoken');
  axios.defaults.xsrfHeaderName = 'x-csrftoken';
  axios.defaults.xsrfCookieName = 'csrftoken'
  axios.defaults.withCredentials = true;

  console.log("Token: " + csrftoken);
*/
  try {
    let res = await axios({
      method:'post', 
      url: 'http://127.0.0.1:8000/api/process_receipt', 
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        //'X-CSRFToken': csrftoken
      },
      //xsrfCookieName: 'csrftoken',
      //xsrfHeaderName: 'X-CSRFToken',
      //withCredentials: true
    })

    return res.data;
  }
  catch (err) {
    console.error(err);
  }
}

interface Dict {
  [key: string]: string
}


export default UploadReceipt;

