package main

import (
	"fmt"
	"github.com/forease/ebase"
	"github.com/gbrlsnchs/jwt"
	"github.com/jonsen/apilib/server"
	"os"
	"regexp"
	"time"
)

var routeReg = regexp.MustCompile(`/api/*|/static/*|/ui/*`)

type Token struct {
	*jwt.JWT
	IsLoggedIn  bool   `json:"isLoggedIn"`
	CustomField string `json:"customField,omitempty"`
}

func reactIndex(c *server.Context) {
	// 处理404时，如果请求的是 /api/ 和 /ui/ 路径，则报404错误
	// 否则返回首页模板
	if c.Req.URL.Path != "/" && routeReg.MatchString(c.Req.URL.Path) {
		c.Text(404, "Page not found")
		return
	}

	c.StaticFile(200, "./ui/build/index.html")
}

func login(c *server.Context) {
	var body map[string]interface{}
	req, err := c.Request(&body)
	if err != nil {
		fmt.Println(err)
		return
	}

	if body["username"] == "testUser" && body["password"] == "123456" {

		// Timestamp the beginning.
		now := time.Now()
		// Define a signer.
		hs256 := jwt.NewHS256("secret")
		jot := &Token{
			JWT: &jwt.JWT{
				Issuer:         "gbrlsnchs",
				Subject:        "someone",
				Audience:       "gophers",
				ExpirationTime: now.Add(24 * 30 * 12 * time.Hour).Unix(),
				NotBefore:      now.Add(30 * time.Minute).Unix(),
				IssuedAt:       now.Unix(),
				ID:             "foobar",
			},
			IsLoggedIn:  true,
			CustomField: "myCustomField",
		}
		jot.SetAlgorithm(hs256)
		jot.SetKeyID("kid")
		payload, err := jwt.Marshal(jot)
		if err != nil {
			// handle error
			ebase.Log.Errorf("jwt.Marshal error %s", err)
		}
		token, err := hs256.Sign(payload)
		if err != nil {
			// handle error

			ebase.Log.Errorf("hs256.Sign error %s", err)
		}
		ebase.Log.Tracef("login authorized. token = %s", token)

		c.Response(200, string(token), "ok")

	} else {
		c.Text(401, "Unauthorized")
		ebase.Log.Info("Unauthorized")
	}

}

func logout(c *server.Context) {

	ebase.Log.Info("logout done.")
	//http.Redirect(w, r, "/login", 302)
}

//openssl req -new -nodes -x509 -out server.pem -keyout server.key -days 3650 -subj "/C=CN/ST=GD/L=Earth/O=forease.net/OU=IT/CN=www.forease.net/emailAddress=im16hot@gmail.com"
func main() {
	ebase.EbaseInit()

	app := server.NewServer("appServer", "1.0")

	pwd, _ := os.Getwd()
	app.Static(pwd+"/ui/build", "/ui")

	app.Get("/api/json", func(c *server.Context) {
		c.Response(200, map[string]interface{}{"user": "my name is xxx"}, "ok")
	})

	app.Post("/api/echo", func(c *server.Context) {
		var body map[string]interface{}
		req, err := c.Request(&body)
		if err != nil {
			fmt.Println(err)
			return
		}

		c.Response(200, req, "ok")
	})

	app.Post("/api/login", login)
	app.Post("/api/logout", logout)

	app.NotFound(reactIndex)

	go func() {
		var err error
		port, _ := ebase.Config.Int("web.port", 8080)
		addr := fmt.Sprintf(":%d", port)
		if sslEnable, _ := ebase.Config.Bool("web.ssl", false); sslEnable {
			sslCA, _ := ebase.Config.String("web.sslca", "etc/key.pem")
			sslKey, _ := ebase.Config.String("web.sslkey", "etc/key.pem")
			sslCert, _ := ebase.Config.String("web.sslcert", "etc/cert.pem")
			err = app.Run(addr, sslKey, sslCert, sslCA)
		} else {
			err = app.Run(addr)
		}

		if err != nil {
			ebase.Log.Error(err)
			fmt.Println(err)
			os.Exit(1)
		}
	}()

	sigFuncs := make(map[string]interface{})

	ebase.SignalHandle(sigFuncs)

}
