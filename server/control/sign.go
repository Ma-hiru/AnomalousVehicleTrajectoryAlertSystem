package control

import (
	"server/utils"
	"sync"
)

type Ev uint8

const (
	ErrEv Ev = iota
	RestartEv
	StopEv
)

func (e Ev) GetName() string {
	switch e {
	case ErrEv:
		return "ErrEv"
	case RestartEv:
		return "RestartEv"
	case StopEv:
		return "StopEv"
	}
	return ""
}

type Role interface {
	GetName() string
}
type Sign struct {
	Form Role
	To   Role
	Ev   Ev
	Err  error
}

type Routine struct {
	Name    string
	Sign    chan Sign
	running bool
	fn      func(control *Control, self *Routine)
}

func NewRoutine(name string, fn func(control *Control, self *Routine)) *Routine {
	return &Routine{
		Name:    name,
		Sign:    make(chan Sign),
		fn:      fn,
		running: false,
	}
}
func (r *Routine) GetName() string {
	return r.Name
}

type Config struct {
	RestartOnErr bool
}

type Control struct {
	Name      string
	Sign      chan Sign
	Config    *Config
	goRoutine map[string]*Routine
	close     sync.Once
}

var allControls = make(map[string]*Control)

func NewControl(name string, routines []*Routine, config *Config) (control *Control, exist bool) {
	var goRoutine = make(map[string]*Routine)
	for _, routine := range routines {
		goRoutine[routine.Name] = routine
	}
	if c, ok := allControls[name]; ok {
		return c, true
	}
	control = &Control{
		Name:      name,
		Sign:      make(chan Sign, 1),
		Config:    config,
		goRoutine: goRoutine,
	}
	allControls[name] = control
	return control, false
}
func GetControl(name string) (control *Control, exit bool) {
	if c, ok := allControls[name]; ok {
		return c, true
	}
	return nil, false
}
func (c *Control) GetName() string {
	return c.Name
}
func (c *Control) Go() {
	defer func() {
		if err := recover(); err != nil {
			utils.Logger().Println(err)
		}
		for _, routine := range c.goRoutine {
			if routine.running {
				routine.Sign <- Sign{
					Ev:   StopEv,
					Form: c,
					To:   routine,
				}
				routine.running = false
			}
		}
		c.Close()
	}()
	for _, routine := range c.goRoutine {
		go routine.fn(c, routine)
		routine.running = true
	}
	for {
		select {
		case v, ok := <-c.Sign:
			if !ok {
				utils.Logger().Printf("control(%s) receive signal close,control is exiting...", c.Name)
				for _, routine := range c.goRoutine {
					if routine.running {
						routine.Sign <- Sign{
							Ev:   StopEv,
							Form: c,
							To:   routine,
						}
						routine.running = false
					}
				}
				return
			}
			switch v.Ev {
			case ErrEv:
				utils.Logger("ControlSign").Printf("Form:%v To:%v Ev:%v Err:%v", v.Form, v.To, v.Ev.GetName(), v.Err)
				if routine, ok := c.goRoutine[v.Form.GetName()]; ok {
					if v.To.GetName() == c.Name && c.Config.RestartOnErr {
						go routine.fn(c, routine)
					} else {
						routine.running = false
					}
				}
			case StopEv:
				utils.Logger("ControlSign").Printf("Form:%v To:%v Ev:%v", v.Form, v.To, v.Ev.GetName())
				if v.Form.GetName() == c.Name {
					//被动停止
					if routine, ok := c.goRoutine[v.To.GetName()]; ok {
						if routine.running {
							routine.Sign <- Sign{
								Ev:   StopEv,
								Form: c,
								To:   v.To,
							}
							routine.running = false
						}
					}
				} else if routine, ok := c.goRoutine[v.Form.GetName()]; ok {
					//主动停止
					routine.running = false
				}
			case RestartEv:
				utils.Logger("ControlSign").Printf("Form:%v To:%v Ev:%v", v.Form, v.To, v.Ev.GetName())
				if routine, ok := c.goRoutine[v.To.GetName()]; ok {
					if routine.running {
						routine.Sign <- Sign{
							Ev:   StopEv,
							Form: c,
							To:   v.To,
						}
					}
					go routine.fn(c, routine)
					routine.running = true
				}
			}
		}
	}
}
func (c *Control) Close() {
	c.close.Do(func() {
		close(c.Sign)
	})
}
func (c *Control) Restart(name string) {
	if routine, ok := c.goRoutine[name]; ok {
		c.Sign <- Sign{
			Ev:   RestartEv,
			Form: c,
			To:   routine,
		}
	}
}
func (c *Control) Stop(name string) {
	if routine, ok := c.goRoutine[name]; ok {
		c.Sign <- Sign{
			Ev:   StopEv,
			Form: c,
			To:   routine,
		}
	}
}
