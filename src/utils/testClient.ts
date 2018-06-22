import * as rp from "request-promise";

export class TestClient {
  url: string;
  jar: any;
  options: {
    jar: any;
    withCredentials: boolean;
    json: boolean;
  };

  constructor(url: string) {
    this.url = url;
    this.options = {
      jar: rp.jar(),
      json: true,
      withCredentials: true,
    };
  }

  meQuery = () => `
  {
    me {
      id
      email
    }
  }
`;

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            logout
          }
        `,
      },
    });
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              id
              email
            }
          }
        `,
      },
    });
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            login(email: "${email}", password: "${password}") {
              path
              message
            }
          }
          `,
      },
    });
  }

  async register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          register(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `,
      },
    });
  }
}
