import React, { useState } from 'react';
import { Redirect } from 'react-router-dom'
import { Result, Button } from 'antd';

const ThankyouPage = () => {
  const [redirectLink, setRedirectLink] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        height: '100vh'
      }}
    >
      <Result
        status="success"
        title="Gửi thông tin thành công"
        subTitle=""
        extra={[
          <Button type="primary" key="console"
            onClick={() => {
              setRedirectLink('/khaibao')
            }}>
            Quay lại
        </Button>
        ]}
      />
      {redirectLink ? <Redirect to={redirectLink} /> : ""}
    </div>
  );
};

export default ThankyouPage;