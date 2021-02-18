import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useQueryState } from 'use-location-state'
import {useAsyncEffect} from 'use-async-effect'
// import useStateRef from 'react-usestateref'
import { makeAutoObservable, runInAction } from "mobx"
import { observer } from "mobx-react-lite" 
import FlexSearch from "flexsearch/dist/module/flexsearch";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Card,
  AutoComplete,
  Tooltip,
} from "antd";
import "./index.css";
import {
  code2Province,
  country_list_type,
  ethnic_group_type,
  religons_type,
  marital_status_type,
  education_type,
  education_field_type,
  position_type,
} from "./hospitals";
import dayjs from "dayjs";
import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";
import generatePicker from "antd/es/date-picker/generatePicker";
import "antd/es/date-picker/style/index";
// import format from 'dayjs';

import "antd/dist/antd.css";
import customParseFormat from "dayjs/plugin/customParseFormat";
const { Option } = Select;

const DatePicker = generatePicker(dayjsGenerateConfig);
dayjs.extend(customParseFormat);

const apiUrl = "http://localhost:9090/";
const serviceURL = "http://localhost:8000/airtable_api";
const idQueryServiceURL = "http://localhost:8000/airtable_staff";
const date_iso_format = "YYYY-MM-DD";

/*const removeVietnameseCharMark = (str) => {
  if (str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  }
  return str;
};//*/

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 4,
    span: 20,
  },
};

const CURRENT_ADDR_FIELD = "Nơi ở hiện tại";
const PERM_ADDR_FIELD = "Nơi ĐK Hộ khẩu thường trú";
const BIRTHPLACE_FIELD = "Nơi khai sinh";
const PROVINCE_CODE_FIELD = "Mã tỉnh thành";
const DISTRICT_CODE_FIELD = "Mã quận huyện";
const WARD_CODE_FIELD = "Mã phường xã";
const PROVINCE_NAME_FIELD = "Tỉnh, thành phố";
const DISTRICT_NAME_FIELD = "Quận, huyện";
const WARD_NAME_FIELD = "Phường, xã";

const HOSPITAL_NAME_FIELD = "Nơi khám chữa bệnh";
const PROVINCE_OF_HOSPITAL_FIELD = "Tỉnh thành nơi KCB";
const HOSPITAL_CODE_FIELD = "Mã bệnh viện nơi KCB";
const PROVINCE_CODE_OF_HOSPITAL_FIELD = "Mã tỉnh thành nơi KCB";
const PRIMARY_FIELD = "Mã NV";



const sample_record = {
    "Họ và tên": "Trần Văn A",
    "Sinh ngày": "1984-10-23",
    "Nơi sinh": "Thành phố Hồ Chí Minh",
    "Giới tính": "Nữ",
    "Hôn nhân": "Độc thân",
    "Số CMND": "001083024326",
    "Ngày cấp": "2021-02-01",
    "Nơi cấp": "Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội",
    "Quốc tịch": "Việt Nam",
    "Dân tộc": "Kinh",
    "Tôn giáo": "Không",
    "Trình độ": "Cao đẳng",
    "Ngành đào tạo": "Ngành Toán ứng dụng",
    "Chức vụ/chức danh": "Phó Giám đốc",
    "Điện thoại": "0984797979",
    "Email": "ducthangho@gmail.com",
    "Nơi ở hiện tại": {
        "Mã tỉnh thành": "1",
        "Tỉnh, thành phố": "Thành phố Hà Nội",
        "Mã quận huyện": "3",
        "Quận, huyện": "Quận Tây Hồ",
        "Mã phường xã": "100",
        "Phường, xã": "Phường Quảng An",
        "Số nhà, tên phố": "Lane 10, Dang Thai Mai"
    },
    "Nơi ĐK Hộ khẩu thường trú": {
        "Mã tỉnh thành": "1",
        "Tỉnh, thành phố": "Thành phố Hà Nội",
        "Mã quận huyện": "6",
        "Quận, huyện": "Quận Đống Đa",
        "Mã phường xã": "223",
        "Phường, xã": "Phường Thịnh Quang",
        "Số nhà, tên phố": "129 Vĩnh Hồ"
    },
    "Nơi khai sinh": {
        "Mã tỉnh thành": "4",
        "Tỉnh, thành phố": "Tỉnh Cao Bằng",
        "Mã quận huyện": "46",
        "Quận, huyện": "Huyện Trà Lĩnh",
        "Mã phường xã": "223",
        "Phường, xã": "Phường Thịnh Quang",
        "Số nhà, tên phố": "129 Vĩnh Hồ"
    },
    "Tỉnh thành nơi KCB": "Thành phố Hà Nội",
    "Nơi khám chữa bệnh": "Bệnh viện đa khoa Đống Đa",
    "Mã tỉnh thành nơi KCB": "1",
    "Mã bệnh viện nơi KCB": "004"
}

class Store
{
    id= "";
    name= "";
    dob= "";
    birthplace= "";
    sex= "";
    marital_status= "";
    id_no= "";
    issues_date= "";
    issuance= "";
    nationality= "";
    ethinicity= "";
    religon= "";
    education= "";
    education_field= "";
    position= "";
    tel= "";
    email= "";
    current_addr_name= "";
    current_addr_province_code= "";
    current_addr_district_opts= [];
    current_addr_district_code= "";
    current_addr_ward_opts= [];
    current_addr_ward_code= "";
    current_addr_address_line1= "";
    current_addr_province= "";
    current_addr_district= "";
    current_addr_ward= "";
    perm_addr_name= "";
    perm_addr_province_code= "";
    perm_addr_district_opts= [];
    perm_addr_district_code= "";
    perm_addr_ward_opts= [];
    perm_addr_ward_code= "";
    perm_addr_address_line1= "";
    perm_addr_province= "";
    perm_addr_district= "";
    perm_addr_ward= "";
    birth_name= "";
    birth_province_code= "";
    birth_district_opts= [];
    birth_district_code= "";
    birth_ward_opts= [];
    birth_ward_code= "";
    birth_address_line1= "";
    birth_province= "";
    birth_district= "";
    birth_ward= "";
    hospital_province_code= "";
    hospital_opts = [];
    hospital_search = null;
    hospital_province_name= "";
    hospital_code= "";
    hospital_name= "";

    constructor() {
        makeAutoObservable(this)
    }


    async fetchInfo(tmp) {
        const map = {
          "current_addr_province_code":  "current_addr_district_opts",
          "perm_addr_province_code": "perm_addr_district_opts",
          "birth_province_code":  "birth_district_opts",
          "current_addr_district_code": "current_addr_ward_opts",
          "perm_addr_district_code": "perm_addr_ward_opts",
          "birth_district_code": "birth_ward_opts",
          "hospital_province_code": "hospital_opts"
        }
        console.log("Fetching....");            
        try {                        
          for (let key in tmp){            
            if (key=="current_addr_province_code" || key=="perm_addr_province_code" || key=="birth_province_code"){
              let code = tmp[key];
              if (code!=""){
                let districtOpts = await getDistrictsByProvinces(code);
                tmp[ map[key] ] = districtOpts;
              }                
            }

            if (key=="current_addr_district_code" || key=="perm_addr_district_code" || key=="birth_district_code"){
              let code = tmp[key];                
              let pr_code = (key=="current_addr_district_code") ? tmp["current_addr_province_code"]
                                : (key=="perm_addr_district_code") ? tmp["perm_addr_province_code"]
                                : tmp["birth_province_code"];
              if (pr_code!="" && code!=""){
                let wardOpts = await getWardsByProvincesDistricts(pr_code, code);
                tmp[ map[key] ] = wardOpts;
              }                
            }

            if (key=="hospital_province_code"){
              let city_code = tmp[key];              
               if (city_code!=""){
                console.log(`getHospitalByCity(city_code=${city_code})`)
                let hospitalOpts = await getHospitalByCity(city_code);
                tmp[ map[key] ] = hospitalOpts;
                if (hospitalOpts && hospitalOpts.length>0){
                  let index = new FlexSearch({    
                      profile: "match",
                      tokenize: "forward",    
                      matcher: matcher,
                      doc: {
                        id: "value",
                        field: "label"
                      }
                  });
                  index.add(hospitalOpts);
                  tmp["hospital_search"] = index;
                }
                
              }
            }
          }

          runInAction( () => {
            for (let key in tmp){
              this[key] = tmp[key];
            }
          } );
          // console.log(JSON.stringify(this));
        } catch (e) {
          console.log(e);
        }//end of try catch              
    }

};

var store = new Store();

const mapping_record_vn_en = {
    "Mã NV": "id",
    "Họ và tên": "name",
    "Sinh ngày": "dob",
    "Nơi sinh": "birthplace",
    "Giới tính": "sex",
    "Hôn nhân": "marital_status",
    "Số CMND": "id_no",
    "Ngày cấp": "issues_date",
    "Nơi cấp": "issuance",
    "Quốc tịch": "nationality",
    "Dân tộc": "ethinicity",
    "Tôn giáo": "religon",
    "Trình độ": "education",
    "Ngành đào tạo": "education_field",
    "Chức vụ/chức danh": "position",
    "Điện thoại": "tel",
    "Email": "email",
    "Nơi ở hiện tại": {
        "Name": "current_addr_name",
        "Mã tỉnh thành": "current_addr_province_code",
        "Mã quận huyện": "current_addr_district_code",
        "Mã phường xã": "current_addr_ward_code",
        "Số nhà, tên phố": "current_addr_address_line1",
        "Tỉnh, thành phố": "current_addr_province",
        "Quận, huyện": "current_addr_district",
        "Phường, xã": "current_addr_ward"
    },
    "Nơi ĐK Hộ khẩu thường trú": {
        "Name": "perm_addr_name",
        "Mã tỉnh thành": "perm_addr_province_code",
        "Mã quận huyện": "perm_addr_district_code",
        "Mã phường xã": "perm_addr_ward_code",
        "Số nhà, tên phố": "perm_addr_address_line1",
        "Tỉnh, thành phố": "perm_addr_province",
        "Quận, huyện": "perm_addr_district",
        "Phường, xã": "perm_addr_ward"
    },
    "Nơi khai sinh": {
        "Name": "birth_name",
        "Mã tỉnh thành": "birth_province_code",
        "Mã quận huyện": "birth_district_code",
        "Mã phường xã": "birth_ward_code",
        "Số nhà, tên phố": "birth_address_line1",
        "Tỉnh, thành phố": "birth_province",
        "Quận, huyện": "birth_district",
        "Phường, xã": "birth_ward"
    },
    "Tỉnh thành nơi KCB": "hospital_province_name",
    "Nơi khám chữa bệnh": "hospital_name",
    "Mã tỉnh thành nơi KCB": "hospital_province_code",
    "Mã bệnh viện nơi KCB":  "hospital_code",
}

const mapping_record_en_vn = {
    "id": "Mã NV",
    "name": "Họ và tên",
    "dob": "Sinh ngày",
    "birthplace": "Nơi sinh",
    "sex": "Giới tính",
    "marital_status": "Hôn nhân",
    "id_no": "Số CMND",
    "issues_date": "Ngày cấp",
    "issuance": "Nơi cấp",
    "nationality": "Quốc tịch",
    "ethinicity": "Dân tộc",
    "religon": "Tôn giáo",
    "education": "Trình độ",
    "education_field": "Ngành đào tạo",
    "position": "Chức vụ/chức danh",
    "tel": "Điện thoại",
    "email": "Email",
    "Nơi ở hiện tại": {
        "current_addr_name": "Name",
        "current_addr_province_code": "Mã tỉnh thành",
        "current_addr_district_code": "Mã quận huyện",
        "current_addr_ward_code": "Mã phường xã",
        "current_addr_address_line1": "Số nhà, tên phố",
        "current_addr_province": "Tỉnh, thành phố",
        "current_addr_district": "Quận, huyện",
        "current_addr_ward": "Phường, xã"
    },
    "Nơi ĐK Hộ khẩu thường trú": {
        "perm_addr_name": "Name",
        "perm_addr_province_code": "Mã tỉnh thành",
        "perm_addr_district_code": "Mã quận huyện",
        "perm_addr_ward_code": "Mã phường xã",
        "perm_addr_address_line1": "Số nhà, tên phố",
        "perm_addr_province": "Tỉnh, thành phố",
        "perm_addr_district": "Quận, huyện",
        "perm_addr_ward": "Phường, xã"
    },
    "Nơi khai sinh": {
        "birth_name": "Name",
        "birth_province_code": "Mã tỉnh thành",
        "birth_district_code": "Mã quận huyện",
        "birth_ward_code": "Mã phường xã",
        "birth_address_line1": "Số nhà, tên phố",
        "birth_province": "Tỉnh, thành phố",
        "birth_district": "Quận, huyện",
        "birth_ward": "Phường, xã"
    },    
    "hospital_province_code": "Mã tỉnh thành nơi KCB",
    "hospital_code": "Mã bệnh viện nơi KCB",
    "hospital_province_name": "Tỉnh thành nơi KCB",
    "hospital_name": "Nơi khám chữa bệnh"
}

const DOB_FIELD = "Sinh ngày";
const ISSUES_DATE = "Ngày cấp";


const renderItem = (code, value) => {
  return {    
    value: code,
    label: value
  };
};

const Complete = (props) => {
  // const [inputRef, setInputFocus] = useFocus();
  const inputRef = useRef(null);
  const { size, ...others } = props;

  return (
    <Tooltip placement="topLeft" arrowPointAtCenter title={props.tooltip}>
      <AutoComplete
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={500}
        filterOption={true}
        allowClear
        ref={inputRef}
        {...others}
      >
        <Input.Search size={size} allowClear />
      </AutoComplete>
    </Tooltip>
  );
};

const NoiCapOpts = [
  renderItem(
    "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư",
    "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
  ),
  renderItem(
    "Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội",
    "Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội"
  ),
].concat(
  Object.entries(code2Province).map((item) => {
    return renderItem(item[0], item[1]);
  })
);

const CountryListOpts = Object.entries(country_list_type).map((item) => {
  return renderItem(item[1], item[0]);
});

const ProvinceListOpts = Object.entries(code2Province).map((item) => {
  return { "label": item[1], "value": item[0] };
});

const EthnicGroupOpts = Object.entries(ethnic_group_type).map((item) => {
  return renderItem(item[1], item[0]);
});

const MaritalStatusOpts = Object.entries(marital_status_type).map((item) => {
  return renderItem(item[1], item[0]);
});

const ReligionOpts = Object.entries(religons_type).map((item) => {
  return renderItem(item[1], item[0]);
});

const EducationOpts = education_type.map((item) => {
  return renderItem(item, item);
});

const EducationFieldOpts = education_field_type.map((item) => {
  return renderItem(item, item);
});

const PositionTypeOpts = position_type.map((item) => {
  return renderItem(item, item);
});

const matcher = {
  "[àáạảãâầấậẩẫăằắặẳẵ]":  "a",
  "[èéẹẻẽêềếệểễ]":  "e",
  "[ìíịỉĩ]":  "i",
  "[òóọỏõôồốộổỗơờớợởỡ]":  "o",
  "[ùúụủũưừứựửữ]":  "u",
  "[ỳýỵỷỹ]":  "y",
  "[đ]":  "d",
  "[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]":  "A",
  "[ÈÉẸẺẼÊỀẾỆỂỄ]":  "E",
  "[ÌÍỊỈĨ]":  "I",
  "[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]":  "O",
  "[ÙÚỤỦŨƯỪỨỰỬỮ]":  "U",
  "[ỲÝỴỶỸ]":  "Y",
  "[Đ]":  "D"
};

var provinceSearch = new FlexSearch({    
    profile: "memory",
    tokenize: "forward",    
    matcher: matcher,
    doc: {
      id: "value",
      field: "label"
    }
});
provinceSearch.add(ProvinceListOpts); 

async function getDistrictsByProvinces(selectedProvince){
  return new Promise( (res,rej) => {
    if (selectedProvince) {       
          axios
            .get(apiUrl + `districts?provinceCode=${selectedProvince}`)
            .then(function (response) {
              // console.log("response", response);
              let districts = response.data;
              if (districts) {
                districts = districts.map((d) => {
                  return { label: d.label, value: d.code };
                });
                res(districts);
              }
            })
            .catch(function (error) {              
              console.log(error);
              rej(error);
            });
    } else res([]);
  });
}

async function getWardsByProvincesDistricts(selectedProvince, selectedDistrict){
    return new Promise( (res,rej) => {
      if (selectedProvince && selectedDistrict) {      
        axios
          .get(
            apiUrl + `wards?provinceCode=${selectedProvince}&districtCode=${selectedDistrict}`)
          .then(function (response) {
            // console.log("response", response);
            let wards = response.data;
            if (wards) {
              wards = wards.map((w) => {
                return { label: w.label, value: w.code };
              });
              res(wards);
            }
          })
          .catch(function (error) {
            // handle error            
            console.log(error);
            rej(error);
          });
      } else res([]);
    });
};

const AddressForm = ({ form, name, opts, w_opts, selProvince }) => {
  const [selectedProvince, setSelectedProvince] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(false);
  // const [selectedWard, setSelectedWard] = useState(false);
  // const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);    
  const [wards, setWards] = useState([]);  
  const [districtSearch, setDistrictSearch] = useState(null);
  const [wardSearch, setWardSearch] = useState(null);
  const empty = { value: undefined, label: undefined};
  const emptyQ = { value: "", label: "Quận, huyện, thị xã"};
  const emptyP = { value: "", label: "Phường, xã, thị trấn"};

  useAsyncEffect( async () => {
     let index = new FlexSearch({    
        profile: "memory",
        tokenize: "forward",    
        matcher: matcher,
        doc: {
          id: "value",
          field: "label"
        }
    });
     if (selectedProvince) {
      console.log("selectedProvince   "+selectedProvince);
      let d = await getDistrictsByProvinces(selectedProvince);
      setDistricts(d);      
      let obj = {};
      // let v = (d && d.length>0) ? d[0] : {};
      // let w = await getWardsByProvincesDistricts(selectedProvince,v.value);
      // setWards(w);      
      setWards([empty]);
      // let vv = (w && w.length>0) ? w[0] : {};
      obj[name] = { "Mã quận huyện": undefined, "Mã phường xã": undefined };
      form.setFieldsValue(obj);      

      
      index.add(d);
      setDistrictSearch(index);
      // setSelectedDistrict(v);
      // console.log(JSON.stringify(obj) );
    } else if (!selectedProvince && selProvince) {
      setSelectedProvince(selProvince);
    } else {       
      index.add([]);
      setDistrictSearch(index);
      setDistricts([]);    
    }
  },[selectedProvince]);
  
  useAsyncEffect(async () => {
   let index = new FlexSearch({    
        profile: "memory",
        tokenize: "forward",    
        matcher: matcher,
        doc: {
          id: "value",
          field: "label"
        }
    }); 
    if (selectedDistrict) {
      console.log("selectedDistrict  "+selectedDistrict)
      let pr_code = (selectedProvince) ? selectedProvince : selProvince;
      let w = await getWardsByProvincesDistricts(pr_code,selectedDistrict);
      setWards(w);
      let obj = {}      
      // let v = (w && w.length>0) ? w[0] : {};
      obj[name] = { "Mã phường xã": undefined };
      form.setFieldsValue(obj);

      index.add(w);
      setWardSearch(index);
      
    } else {
      setWards([]);
      setWardSearch(index);
    }
  }, [selectedDistrict]);



  return (
    <Input.Group size="compact">
      <Form.Item
        name={[name, "Mã tỉnh thành"]}
        noStyle        
        rules={[{ required: false, message: "Cần cung cấp tỉnh/thành phố" }]}
      >
        <Select
          placeholder="Tỉnh, thành phố"
          showSearch={true}
          allowClear
          optionFilterProp="label"          
          style={{ width: "33%" }}
          labelInValue={true}
          onDropdownVisibleChange={ (open) => {
            // console.log("onDropdownVisibleChange");
          }}
          filterOption={(value, option) => {
            if (option && provinceSearch){
              let results = provinceSearch.search({
                field: "label",
                query: value
              })
              for (let item of results){
                if (option.value==item.value) return true;
              }
            }
            return false;    
          }}
          options={ProvinceListOpts}
          onChange={(item) => {            
            let value = (!item || typeof item === 'string') ? item : item.value;
            console.log(item);
            setSelectedProvince(value);
          }}
            
        />
      </Form.Item>

      <Form.Item
        name={[name, "Mã quận huyện"]}
        noStyle
        rules={[{ required: false, message: "Cần cung cấp Quận/huyện/thị xã" }]}
      >
        <Select
          placeholder="Quận, huyện, thị xã"
          showSearch={true}
          labelInValue={true}
          allowClear          
          style={{ width: "33%" }}
          optionFilterProp="label"
          options={(districts.length>0) ? districts : opts}
          
          filterOption={(input, option) =>{            
            let results;
            if (!input || !option) return false;
            if (districtSearch && districtSearch.length>0){
              results = districtSearch.search({
                field: "label",
                query: input
              });
            } else if (opts){
              let index = new FlexSearch({    
                  profile: "memory",
                  tokenize: "forward",    
                  matcher: matcher,
                  doc: {
                    id: "value",
                    field: "label"
                  }
              }); 
              index.add(opts);              
              results = index.search({
                field: "label",
                query: input
              });

            }
            if (results){
              for (let item of results){
                  if (option.value==item.value) return true;
              }
            }
            return false;  
          }}
          onChange={(item) => {            
            let value = (!item || typeof item === 'string') ? item : item.value;
            // console.log("Setting   "+JSON.stringify(item));
            setSelectedDistrict(value);
          }}
        />
      </Form.Item>

      <Form.Item
        name={[name, "Mã phường xã"]}
        noStyle
        rules={[
          { required: false, message: "Cần cung cấp Phường/xã/thị trấn" },
        ]}
      >
        <Select
          placeholder="Phường, xã, thị trấn"
          showSearch={true}
          labelInValue={true}          
          allowClear
          optionFilterProp="label"
          style={{ width: "34%" }}
          filterOption={(input, option) => {
            let results;
            if (!input || !option) return false;
            if (wardSearch && wardSearch.length>0){
              results = wardSearch.search({
                field: "label",
                query: input
              });
            } else if (w_opts){
              let index = new FlexSearch({    
                  profile: "memory",
                  tokenize: "forward",    
                  matcher: matcher,
                  doc: {
                    id: "value",
                    field: "label"
                  }
              }); 
              index.add(w_opts);              
              results = index.search({
                field: "label",
                query: input
              });

            }
            if (results){
              for (let item of results){
                  if (option.value==item.value) return true;
              }
            }
            return false;  
          }}
          // onChange={(value) => {
          //   setSelectedWard(value);
          // }}
          options={(wards.length>0) ? wards : w_opts}
        />
      </Form.Item>

      <Form.Item
        name={[name, "Số nhà, tên phố"]}
        noStyle
        rules={[
          {
            required: false,
            message: "Cần cung cấp Số nhà phố/đường/thôn/xóm",
          },
        ]}
      >
        <Input placeholder="Số nhà phố/đường/thôn/xóm" />
      </Form.Item>
    </Input.Group>
  );
};

function disabledDate(current) {
  // Can not select days before today and today
  return current && current > dayjs();
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function toPrefill(obj){
  let en = {};  
  for (let key in obj){
    if (key==CURRENT_ADDR_FIELD || key==PERM_ADDR_FIELD || key==BIRTHPLACE_FIELD){
      let val = obj[key];
      for (let k in val){
        let en_key = mapping_record_vn_en[key][k];
        en[en_key] = val[k]+"";
      }//end of for
      continue;
    }//end of for
    let en_key = mapping_record_vn_en[key]
    en[en_key] = obj[key]+"";
  }
  return en;
}

function useStateRef(defaultValue) {
    var [state, setState] = React.useState(defaultValue);

    var ref = React.useRef(defaultValue);
    ref.current = state; 

    return [ state, setState, ref ];
}

async function getHospitalByCode(city_code,code){  
  return new Promise( (res,rej) => {
    // console.log(apiUrl + `hospitals?city_code=${city_code}&code=${code}`);
    axios
    .get(apiUrl + `hospitals?city_code=${city_code}&code=${code}`)
    .then(function (response) {
      // console.log("response", response);
      let hospitals = response.data;
      if (hospitals) {
        hospitals = hospitals.map((h) => {
          return { label: h.label, value: h.code };
        });
        res(hospitals);
        return;
      } 
      res(null);
    })
    .catch(function (error) {
      // handle error            
      rej(error);
      console.log(error);
    });  
  });
}

async function getHospitalByCity(city_code){    
  return new Promise( (res,rej) => {
    axios
      .get(apiUrl + `hospitals?city_code=${city_code}`)
      .then(function (response) {
        // console.log("response", response);
        let hospitals = response.data;
        if (hospitals) {
          hospitals = hospitals.map((h) => {
            return { label: h.label, value: h.code };
          });
          res(hospitals);
          return; 
        }
        res(null);
      })
      .catch(function (error) {
        // handle error
        rej(error);
        console.log(error);
      });
  });
}

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
}

async function fillForm(form, prefill){    
  let city_code, hospital_code;
  console.log(JSON.stringify(prefill));  
  let obj = {};
  for (let key in prefill){
    // console.log("setFieldsValue   "+key+"    "+prefill[  key  ]);    
    let val = prefill[key];
    if (key==DOB_FIELD || key==ISSUES_DATE){
      obj[key] = dayjs(val,date_iso_format,true);
    } else if (key==CURRENT_ADDR_FIELD || key==PERM_ADDR_FIELD || key==BIRTHPLACE_FIELD){        
      let nobj = {};
      for (let k in val){
        let v = val[k];        
        if (k==PROVINCE_CODE_FIELD || k==PROVINCE_NAME_FIELD){
          let tmp = nobj[PROVINCE_CODE_FIELD];
          if (!tmp) tmp = {};
          if (k==PROVINCE_CODE_FIELD) {
            tmp.value = v+"";
          }
          else tmp.label = v;
          nobj[PROVINCE_CODE_FIELD] = tmp;        

        } else if (k==DISTRICT_CODE_FIELD || k==DISTRICT_NAME_FIELD){
          let tmp = nobj[DISTRICT_CODE_FIELD];
          if (!tmp) tmp = {};
          if (k==DISTRICT_CODE_FIELD) 
            tmp.value = v;
          else tmp.label = v;
          nobj[DISTRICT_CODE_FIELD] = tmp;
        } else if (k==WARD_CODE_FIELD || k==WARD_NAME_FIELD){
          let tmp = nobj[WARD_CODE_FIELD];
          if (!tmp) tmp = {};
          if (k==WARD_CODE_FIELD) 
            tmp.value = v;
          else tmp.label = v;
          nobj[WARD_CODE_FIELD] = tmp;
        } else nobj[k] = v;
      }//end of for
      obj[key] = nobj;
    } else if (key==PROVINCE_OF_HOSPITAL_FIELD || key==PROVINCE_CODE_OF_HOSPITAL_FIELD){
      if (!city_code){//Not yet found city_code
        let tmp = obj[PROVINCE_OF_HOSPITAL_FIELD];
        if (!tmp) tmp = {};
        
        tmp.label = prefill[PROVINCE_OF_HOSPITAL_FIELD];        
        tmp.value = prefill[PROVINCE_CODE_OF_HOSPITAL_FIELD];
        city_code = tmp.value;
        if (city_code && !tmp.label) 
          tmp.label = code2Province[city_code];
        else if (!city_code && tmp.label){
          for (let key in code2Province){
            let val = code2Province[key];
            if (val==tmp.label){
              tmp.value = key;
              city_code = key;
              break;
            }//end of if
          }
        }

        
        obj[PROVINCE_OF_HOSPITAL_FIELD] = tmp;        
        // console.log(JSON.stringify(tmp));
      }      
    } else if (key == HOSPITAL_NAME_FIELD || key==HOSPITAL_CODE_FIELD) {      
      let tmp = obj[HOSPITAL_NAME_FIELD];
      if (!tmp) tmp = {};
      tmp.label = prefill[HOSPITAL_NAME_FIELD];        
      tmp.value = prefill[HOSPITAL_CODE_FIELD];
      hospital_code = tmp.value;

      if (hospital_code && !tmp.label) {
        let hospitals = await getHospitalByCode(city_code,hospital_code);
        if (hospitals && hospitals.length>0)
          tmp.label = hospitals[0].label;        
      } else if (!hospital_code && city_code && tmp.label){
        let hospitals = await getHospitalByCity(city_code);
        for (let h of hospitals){
          let l = h.label;
          if (l==tmp.label){
            tmp.value = h.code;
            hospital_code = h.code;
            break;
          }//end of if
        }
      }

      obj[HOSPITAL_NAME_FIELD] = tmp;
      // console.log(JSON.stringify(tmp));      
    } else obj[key] = prefill[key];
  
  }//end of for  
  form.setFieldsValue(obj);    
  // console.log(JSON.stringify(obj));
    
  await store.fetchInfo(prefill);
}

function fromRecordArray(arr){
  let data = {};
  let idx = 0;
  data.id = arr[idx++];
  data.name = arr[idx++];
  data.dob = arr[idx++];
  data.birthplace = arr[idx++];
  data.sex = arr[idx++];
  data.marital_status = arr[idx++];
  data.id_no = arr[idx++];
  data.issues_date = arr[idx++];
  data.issuance = arr[idx++];
  data.nationality = arr[idx++];
  data.ethinicity = arr[idx++];
  data.religon = arr[idx++];
  data.education = arr[idx++];
  data.education_field = arr[idx++];
  data.position = arr[idx++];
  data.tel = arr[idx++];
  data.email = arr[idx++];
  data.current_addr_name = arr[idx++];
  data.current_addr_province_code = arr[idx++];            
  data.current_addr_district_code = arr[idx++];            
  data.current_addr_ward_code = arr[idx++];
  data.current_addr_address_line1 = arr[idx++];
  data.current_addr_province = arr[idx++];
  data.current_addr_district = arr[idx++];
  data.current_addr_ward = arr[idx++];
  data.perm_addr_name = arr[idx++];
  data.perm_addr_province_code = arr[idx++];            
  data.perm_addr_district_code = arr[idx++];            
  data.perm_addr_ward_code = arr[idx++];
  data.perm_addr_address_line1 = arr[idx++];
  data.perm_addr_province = arr[idx++];
  data.perm_addr_district = arr[idx++];
  data.perm_addr_ward = arr[idx++];
  data.birth_name = arr[idx++];
  data.birth_province_code = arr[idx++];            
  data.birth_district_code = arr[idx++];            
  data.birth_ward_code = arr[idx++];
  data.birth_address_line1 = arr[idx++];
  data.birth_province = arr[idx++];
  data.birth_district = arr[idx++];
  data.birth_ward = arr[idx++];
  data.hospital_province_code = arr[idx++];            
  data.hospital_province_name = arr[idx++];
  data.hospital_code = arr[idx++];
  data.hospital_name = arr[idx++];
  return data;
}

function toRecordArray(data){
  let arr = [];
  let idx = 0;
  arr[idx++] = data.id;
  arr[idx++] = data.name;
  arr[idx++] = data.dob;
  arr[idx++] = data.birthplace;
  arr[idx++] = data.sex;
  arr[idx++] = data.marital_status;
  arr[idx++] = data.id_no;
  arr[idx++] = data.issues_date;
  arr[idx++] = data.issuance;
  arr[idx++] = data.nationality;
  arr[idx++] = data.ethinicity;
  arr[idx++] = data.religon;
  arr[idx++] = data.education;
  arr[idx++] = data.education_field;
  arr[idx++] = data.position;
  arr[idx++] = data.tel;
  arr[idx++] = data.email;
  arr[idx++] = data.current_addr_name;
  arr[idx++] = data.current_addr_province_code;            
  arr[idx++] = data.current_addr_district_code;            
  arr[idx++] = data.current_addr_ward_code;
  arr[idx++] = data.current_addr_address_line1;
  arr[idx++] = data.current_addr_province;
  arr[idx++] = data.current_addr_district;
  arr[idx++] = data.current_addr_ward;
  arr[idx++] = data.perm_addr_name;
  arr[idx++] = data.perm_addr_province_code;            
  arr[idx++] = data.perm_addr_district_code;            
  arr[idx++] = data.perm_addr_ward_code;
  arr[idx++] = data.perm_addr_address_line1;
  arr[idx++] = data.perm_addr_province;
  arr[idx++] = data.perm_addr_district;
  arr[idx++] = data.perm_addr_ward;
  arr[idx++] = data.birth_name;
  arr[idx++] = data.birth_province_code;            
  arr[idx++] = data.birth_district_code;            
  arr[idx++] = data.birth_ward_code;
  arr[idx++] = data.birth_address_line1;
  arr[idx++] = data.birth_province;
  arr[idx++] = data.birth_district;
  arr[idx++] = data.birth_ward;
  arr[idx++] = data.hospital_province_code;            
  arr[idx++] = data.hospital_province_name;
  arr[idx++] = data.hospital_code;
  arr[idx++] = data.hospital_name;
  return arr;
}

const InfoForm = observer( () => {
  console.log("Start rendering");
  const [form] = Form.useForm();
  // const [cities, setCities] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalSearch, setHospitalSearch] = useState(null);
  const [selectedCity, setSelectedCity] = useState(false);
  const [redirectLink, setRedirectLink] = useState(false);  
  // const [prefill] = useState( () => new Store() );
  
  const [id, set_id] = useQueryState("id","");
  const [record,set_record] = useQueryState("record",[])

  useAsyncEffect( async () => {
    if (id && id!="") {
        console.log("ID is "+id);        
        let fields = Object.keys(sample_record);    
        let payload = JSON.stringify({id : id, primary: PRIMARY_FIELD, fields: fields});    
        if (!record || record.length==0){          
            try {
            let response = await fetch(idQueryServiceURL, {
              method: "POST",
              body: payload,
              headers: {
                  "Content-Type": "application/json",
              },
              redirect: 'follow'
            });
            let res = await response.json();                    
            let tmp = res.data;
            await fillForm(form, tmp);
            // let arr = toRecordArray(store);
            // set_record(arr);
          } catch (e) {
            console.log(e);
          }//end of try catch                          
        } else {
            let data = fromRecordArray(record);
            data.id = id;            
            await fillForm(form, data);           
        }            
    } else if (record && record.length>0){
      let data = fromRecordArray(record);
      data.id = id;            
      await fillForm(form, data); 
    }  
  },[id]);  
  
  const dateFormat = "DD/MM/YYYY";

  useAsyncEffect( async () => {   
    let index = new FlexSearch({    
        profile: "match",
        tokenize: "forward",    
        matcher: matcher,
        doc: {
          id: "value",
          field: "label"
        }
    });
    if (selectedCity) {
      try {
        let hospitals = await getHospitalByCity(selectedCity);
        setHospitals(hospitals);           
        let obj = { "Nơi khám chữa bệnh": undefined };
        form.setFieldsValue(obj);            
        index.add(hospitals);               
      } catch(err){
        console.log(err);
        setHospitals([]);
      }
      
    } else {
      setHospitals([]);
    }
    setHospitalSearch(index);
  }, [selectedCity]);

  const onFinish = async (values) => {
    for (let key in values) {
      let val = values[key];
      if (key==CURRENT_ADDR_FIELD || key==PERM_ADDR_FIELD || key==BIRTHPLACE_FIELD){
        let obj = {};
        for (let k in val){
          let v = val[k];
          if (v && v.value) {
            if (v.value=="") continue;
            obj[k] = v.value+"";
            if (k == PROVINCE_CODE_FIELD) 
              obj[PROVINCE_NAME_FIELD] = v.label;
            else if (k == DISTRICT_CODE_FIELD) 
              obj[DISTRICT_NAME_FIELD] = v.label;
            else if (k == WARD_CODE_FIELD) 
              obj[WARD_NAME_FIELD] = v.label;            
          } else if (v) obj[k] = v;
          
        }//end of for
        values[key] = obj;
      } else if (dayjs.isDayjs(val)) {
        values[key] = val.format(date_iso_format);
      } else if (key == PROVINCE_OF_HOSPITAL_FIELD ){
        if (val && val.value){
          values[key] = val.label;
          values[PROVINCE_CODE_OF_HOSPITAL_FIELD] = val.value;
        }        
      } else if (key == HOSPITAL_NAME_FIELD){
        if (val && val.value){
          values[key] = val.label;
          values[HOSPITAL_CODE_FIELD] = val.value;
        }
      }
      
    }
    let payload = JSON.stringify(values);    
    console.log("Sending ...");
    console.log(payload);
    let response = await fetch(serviceURL, {
        method: "POST",
        body: payload,
        headers: {
            "Content-Type": "application/json",
        },
    });

    let res = await response.json();    
    setRedirectLink("/thankyou");
  };

  const onReset = () => {
    form.resetFields();
  };

  // console.log("Rendering  "+PRIMARY_FIELD+"    "+id);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#d7e8f1",
        // height: '100vh'
      }}
    >
      <Card
        title="THÔNG TIN NHÂN SỰ"
        bordered={false}
        style={{ minWidth: 600 }}
      >
        <Form
          {...layout}
          form={form}
          action="https://docs.google.com/forms/d/e/1FAIpQLScnJeGE8pPwb133gPVGF_a8Y7YjWIYZ3ugQTln8wj2ldiZkZw/formResponse"
          method="POST"
          onFinish={onFinish}          
        >

          <Form.Item name={PRIMARY_FIELD} hidden={true} initialValue={id}>
            <Input value={id} />
          </Form.Item>

          <Row>
            <Col span={16}>
              <Form.Item
                name="Họ và tên"
                label="Họ và tên"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 8 }}                
                style={{
                  marginBottom: "0px",
                  paddingBottom: "0px",
                  whiteSpace: "nowrap",
                }}                
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={1} />

            <Col span={7}>
              <Form.Item
                name="Sinh ngày"
                label="Ngày sinh"
                labelCol={{ span: 8, offset: 0 }}                
                wrapperCol={{ flex: "auto" }}
                colon="true"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  mode="date"
                  showTime={false}
                  size="middle"
                  disabledDate={disabledDate}
                  style={{
                    width: "100%",
                    marginBottom: "0px",
                    paddingBottom: "0px",
                  }}
                  format={dateFormat}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={10}>
              <Form.Item
                name="Nơi sinh"
                label="Nơi sinh"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
                style={{
                  paddingBottom: "0px",
                  marginBottom: "0px",
                  whiteSpace: "nowrap",
                }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                name="Giới tính"
                label="Giới tính"
                labelCol={{ span: 8, offset: 2 }}
                wrapperCol={{ span: 12 }}
                style={{ whiteSpace: "nowrap" }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select
                  // options={cities}
                  optionFilterProp="vn"
                  placeholder="Nam/nữ"
                  style={{ width: "100%", whiteSpace: "nowrap" }}
                >
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="Hôn nhân"
                label="Hôn nhân"
                labelCol={{ span: 8, offset: 2 }}
                wrapperCol={{ span: 12 }}
                style={{ whiteSpace: "nowrap" }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select
                  options={MaritalStatusOpts}
                  optionFilterProp="vn"
                  placeholder="Tình trạng hôn nhân"
                  style={{ width: "100%", whiteSpace: "nowrap" }}
                ></Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={8}>
              <Form.Item
                name="Số CMND"
                label="Số CMND"
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 12 }}
                rules={[
                  {
                    required: false,
                  },
                ]}
                style={{ marginBottom: "0px" }}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item
                labelCol={{ span: 9, offset: 2 }}
                wrapperCol={{ span: 14 }}
                name="Ngày cấp"
                label="Ngày cấp"
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  mode="date"
                  showTime={false}
                  size="middle"
                  disabledDate={disabledDate}
                  style={{
                    width: "100%",
                    marginBottom: "0px",
                    paddingBottom: "0px",
                  }}
                  format={dateFormat}
                />
              </Form.Item>
            </Col>

            <Col span={9}>
              <Form.Item
                name="Nơi cấp"
                label="Nơi cấp"
                labelCol={{ span: 8, offset: 0 }}
                wrapperCol={{ span: 16 }}
                style={{
                  marginBottom: "0px",
                  paddingBottom: "0px",
                  whiteSpace: "nowrap",
                }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Complete
                  options={NoiCapOpts}
                  size="small"
                  style={{
                    width: "100%",
                    marginBottom: "0px",
                    paddingBottom: "0px",
                    whiteSpace: "nowrap",
                  }}
                  tooltip='Đối với thẻ CCCD làm từ 01/01/2016 đến trước ngày 10/10/2018 thì nơi cấp là "Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư". Với các thẻ làm từ ngày 10/10/2018 thì nơi cấp chính xác là "Cục trưởng Cục Cảnh sát quản lý hành chính về trật tự xã hội".'
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={9}>
              <Form.Item
                name="Quốc tịch"
                label="Quốc tịch"
                colon="true"
                labelCol={{ span: 10, offset: 1 }}
                wrapperCol={{ span: 14 }}
                style={{
                  paddingLeft: "0px",
                  marginLeft: "0px",
                  whiteSpace: "nowrap",
                }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                {/*<Input size="middle" style={{ paddingLeft: "0px", paddingTop: "0px", marginTop: "0px", whiteSpace: 'nowrap', width: "100%" }}/>*/}
                <Select
                  options={CountryListOpts}
                  style={{
                    paddingLeft: "0px",
                    paddingTop: "0px",
                    marginTop: "0px",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                  tooltip="Chọn quốc tịch."
                />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item
                name="Dân tộc"
                label="Dân tộc"
                colon="true"
                labelCol={{ span: 9, offset: 1 }}
                wrapperCol={{ span: 14 }}
                style={{ marginBottom: "0px" }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select
                  options={EthnicGroupOpts}
                  style={{
                    paddingLeft: "0px",
                    paddingTop: "0px",
                    marginTop: "0px",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                  tooltip="Chọn dân tộc."
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="Tôn giáo"
                label="Tôn giáo"
                colon="true"
                labelCol={{ span: 9, offset: 1 }}
                wrapperCol={{ span: 14 }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Select
                  options={ReligionOpts}
                  style={{
                    paddingLeft: "0px",
                    paddingTop: "0px",
                    marginTop: "0px",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                  tooltip="Chọn tôn giáo."
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={8}>
              <Form.Item
                name="Trình độ"
                label="Trình độ"
                colon="true"
                labelCol={{ span: 8, offset: 4 }}
                wrapperCol={{ span: 12 }}
                style={{
                  paddingLeft: "0px",
                  marginLeft: "0px",
                  whiteSpace: "nowrap",
                }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                {/*<Input size="middle" style={{ paddingLeft: "0px", paddingTop: "0px", marginTop: "0px", whiteSpace: 'nowrap', width: "100%" }}/>*/}
                <Complete
                  options={EducationOpts}
                  style={{
                    paddingLeft: "0px",
                    paddingTop: "0px",
                    marginTop: "0px",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                  size="middle"
                  tooltip="Chọn trình độ."
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="Ngành đào tạo"
                label="Ngành đào tạo"
                colon="true"
                labelCol={{ span: 9, offset: 1 }}
                wrapperCol={{ span: 14 }}
                style={{ marginBottom: "0px" }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Complete
                  options={EducationFieldOpts}
                  style={{
                    paddingLeft: "0px",
                    paddingTop: "0px",
                    marginTop: "0px",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                  tooltip="Chọn ngành đào tạo."
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="Chức vụ/chức danh"
                label="Chức vụ/chức danh"
                colon="true"
                labelCol={{ span: 10, offset: 1 }}
                wrapperCol={{ span: 13 }}
                style={{ marginBottom: "0px" }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Complete
                  options={PositionTypeOpts}
                  style={{
                    paddingLeft: "0px",
                    paddingTop: "0px",
                    marginTop: "0px",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                  tooltip="Chọn chức vụ, chức danh."
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={12}>
              <Form.Item
                name="Điện thoại"
                label="Điện thoại"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ marginBottom: "0px" }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Email"
                label="Email"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ paddingLeft: "10%" }}
                rules={[
                  {
                    required: false,
                  },
                ]}
              >
                <Input style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Chỗ ở hiện tại"
            rules={[
              {
                required: false,
              },
            ]}
          >
            {/* <Input id="1065046570" name="entry.1065046570"/> */}
            <AddressForm form={form} name="Nơi ở hiện tại" opts={store.current_addr_district_opts} w_opts={store.current_addr_ward_opts} selProvince={store.current_addr_province_code} />
          </Form.Item>

          <Form.Item
            label="Địa chỉ thường trú"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <AddressForm form={form} name="Nơi ĐK Hộ khẩu thường trú" opts={store.perm_addr_district_opts} w_opts={store.perm_addr_ward_opts} selProvince={store.perm_addr_province_code}/>
          </Form.Item>

          <Form.Item
            label="Nơi khai sinh"
            rules={[
              {
                required: false,
              },
            ]}
          >
            {/* <Input id="1065046570" name="entry.1065046570"/> */}
            <AddressForm form={form} name="Nơi khai sinh" opts={store.birth_district_opts} w_opts={store.birth_ward_opts} selProvince={store.birth_province_code}/>
          </Form.Item>

          <fieldset>
            <legend>THÔNG TIN KHÁM CHỮA BỆNH</legend>
          </fieldset>

          <Form.Item
            name="Tỉnh thành nơi KCB"
            label="Tỉnh thành nơi KCB"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select
              showSearch={true}
              labelInValue={true}
              // options={cities}
              optionFilterProp="label"
              placeholder="Nhập tên tỉnh, thành phố"
              filterOption={(value, option) => {
                if (option && provinceSearch){
                  let results = provinceSearch.search({
                    field: "label",
                    query: value
                  })
                  for (let item of results){
                    if (option.value==item.value) return true;
                  }
                }
                return false; 
              }}
              onChange={(item) => {
                let value = (!item || typeof item === 'string') ? item : item.value;
                setSelectedCity(value);
                // console.log("Selected " + value);
              }}
              options={ProvinceListOpts}
            />
          </Form.Item>

          <Form.Item
            name="Nơi khám chữa bệnh"
            label="Bệnh viện nơi KCB"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select
              showSearch={true}
              labelInValue={true}
              allowClear
              style={{ width: "100%" }}              
              // name="entry.1676908992"
              placeholder="Chọn bệnh viện"
              optionFilterProp="label"
              filterOption={(input, option) => {
                let results;
                if (!input || !option) return false;
                if (hospitalSearch && hospitalSearch.length>0){
                  results = hospitalSearch.search({
                    field: "label",
                    query: input
                  });
                } else if (store.hospital_search && store.hospital_search.length>0){                               
                  results = store.hospital_search.search({
                    field: "label",
                    query: input
                  });
                } else if (store.hospital_opts && store.hospital_opts.length>0){
                  let index = new FlexSearch({    
                      profile: "memory",
                      tokenize: "forward",    
                      matcher: matcher,
                      doc: {
                        id: "value",
                        field: "label"
                      }
                  }); 
                  index.add(store.hospital_opts);              
                  results = index.search({
                    field: "label",
                    query: input
                  });

                }
                if (results){
                  for (let item of results){
                      if (option.value==item.value) return true;
                  }
                }
                return false;
              }}
              options={(hospitals && hospitals.length>0) ? hospitals : store.hospital_opts}
            />
          </Form.Item>

          <Form.Item
            {...tailLayout}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
          >
            <Row>
              <Col span={2} offset={11}>
                <Button type="primary" htmlType="submit">
                  Gửi
                </Button>
              </Col>
              <Col span={11} offset={0}>
                <Button htmlType="button" onClick={onReset}>
                  Làm lại
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Card>
      {redirectLink ? <Redirect to={redirectLink} /> : ""}
    </div>
  );
});

export default InfoForm;
