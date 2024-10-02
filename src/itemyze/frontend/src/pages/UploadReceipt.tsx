import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import sendReceiptData from '../utils/sendReceiptData';
import setGroupId from '../utils/setGroupId';
import Dict from '../interfaces/Dict';

import '../styles/UploadReceipt.scss';
import ItemList from '../components/ItemList';

function UploadReceipt() {
  const [groups, setGroups] = useState<Dict[]>([]);
  const [expenseId, setExpenseId] = useState<number>();
  const [currency, setCurrency] = useState<string>("");
  const [currencies, setCurrencies] = useState<Dict[]>([]);
  const [receipt, setReceipt] = useState<File>();

  useEffect(() => {
    axios
      .get('/api/get_groups')
      .then(res => setGroups(res.data.groups));

    axios
      .get('/api/get_currencies')
      .then(res => setCurrencies(res.data.currencies));
  }, []);

  useEffect(() => {
    displayPreview()
  }, [currency, receipt]);

  type Inputs = {
    group: string,
    currency: string,
    receipt: FileList,
  };

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = data => {
    if (expenseId !== undefined) {
      setGroupId(expenseId, data.group);

      navigate(
        '/itemise', {
          state: {
            expenseId: expenseId
          }
        }
      );
    }
  };
  const displayPreview = async() => {
    if(receipt !== undefined && currency !== undefined && currency !== "") {
      await sendReceiptData(receipt, currency)
        .then(res => {
          setExpenseId(res.expenseId);
          return res.expenseId
        });
    }
  }
  
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
        <label className="form-item required" htmlFor="currency">Currency</label>
        <select 
          className="form-item"
          defaultValue=""
          { ...register("currency", { 
            required: true,
            onChange: e => { setCurrency(e.target.value); }
          })}
        >
          <option value="" disabled>Please select a currency</option>
          { currencies.map(currency => (
            <option key={ currency.currency_code } value={ currency.unit }>{ `${currency.currency_code} (${currency.unit})` }</option>
          ))}
        </select>
        <label className="form-item required">Upload Receipt</label>
        <input 
          className="form-item" 
          type="file"
          { ...register("receipt", { required: true })}
          onChange={ async (e) => {
            if (e.target.files) {
              setReceipt(e.target.files[0]);
            }
          }}
        />
        {(errors.group || errors.receipt) && <span id="validation-msg">
          Please check the required fields
        </span>}
        <button className="form-item btn-m">Submit</button>
      </form>
      { expenseId !== undefined && 
        <div id="receipt-items">
          <h3>Preview</h3>
          <ItemList expenseId={expenseId} itemise={false} />
        </div>
      }
    </div>
  );
}

export default UploadReceipt;

