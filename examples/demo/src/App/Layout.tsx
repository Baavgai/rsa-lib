import * as React from "react";

import { AppProps } from "./types";

const Arrow = () =>
    <svg width={36} height={36} viewBox="0 0 16 16" className="bi bi-arrow-right-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path fillRule="evenodd" d="M4 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5A.5.5 0 0 0 4 8z" />
    </svg>;

const ArrowLayout = () =>
    <div className="col-1"><div className="pt-4"><Arrow /></div></div>;

const Page: React.FC = ({ children }) =>
    <>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark static-top">
            <div className="container">
                <span className="navbar-brand">Secure Tester</span>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
            </div>
        </nav>
        <div className="container" style={{ marginTop: "2em" }}>
            {children}
        </div>
    </>
    ;

const CardValue = (p: { value: string }) =>
    <div className="card"><div className="card-body">{p.value}</div></div>;

const SentItem = (p: { label: string; value: string }) =>
    <div className="col-3">
        <label>{p.label}</label>
        <CardValue {...p} />
    </div>
    ;

const Content = (p: AppProps) =>
    <div>
        <form onSubmit={e => { e.preventDefault(); p.sendMessage(); }}>
            <div className="form-group row">
                <label className="col-2 col-form-label">Message</label>
                <div className="col-6 pl-1">
                    <input type="text" className="form-control"
                        placeholder="Your plain text here"
                        value={p.message} onChange={e => p.updateMessage(e.target.value)}></input>
                </div>
                <div className="col">
                    <button type="submit" className="d-inline-block btn btn-primary">Send</button>
                </div>
            </div>
        </form>
        <div className="row">
            <SentItem label="Sent" value={p.messageSent} />
            <ArrowLayout />
            <SentItem label="Sent Enc" value={p.messageSentEnc} />
            <ArrowLayout />
            <SentItem label="Server Decode" value={p.messageServerDecode} />
        </div>
        <div className="row">
            <div className="col">
                <label>Server Pub Key</label>
                <CardValue value={p.serverKey} />
            </div>
        </div>
    </div>
    ;

export const Layout = (p: AppProps) =>
    <Page><Content {...p} /></Page>;

/*
            <div className="row">
            <div className="col-6">
                {children}
            </div>
        </div>
        <div class="form-group mx-sm-3 mb-2">
            <label for="inputPassword2" class="sr-only">Password</label>
            <input type="password" class="form-control" id="inputPassword2" placeholder="Password">
  </div>
            <button type="submit" class="btn btn-primary mb-2">Confirm identity</button>
</form>
const Item: React.FC<{ label: string }> = p =>
    <div className="form-group row">
            <label className="col-2 col-form-label">{p.label}</label>
            <div className="col pl-1">{p.children}</div>
        </div>;

const ItemStatic = (p: {label: string; value: string }) =>
    <Item label={p.label}>
            <input type="text" readOnly={true} className="form-control-plaintext" value={p.value}></input>
        </Item>;
const ItemStatic = (p: {label: string; value: string }) =>
    <Item label={p.label}>
            <div className="col-6 pl-1">
                <input type="text" readOnly={true} className="form-control-plaintext" value={p.value}></input>
            </div>
        </Item>;
const SentItem = (p: {label: string; value: string }) =>
    <div className="col">
            <div className="card col">
                <div className="card-title">{p.label}</div>
                <div className="card-body">{p.value}</div>
            </div>
        </div>
    ;
const SendPath = (p: AppProps) =>
    <div className="row">
            <SentItem label="Sent" value={p.messageSent} />
            <SentItem label="Sent Enc" value={p.messageSentEnc} />
            <SentItem label="Server Decode" value={p.messageServerDecode} />
        </div>;
const SentItem = (p: { label: string; value: string }) =>
    <div className="col-4">
        <label>{p.label}</label>
        <CardValue {...p} />
    </div>
    ;


*/