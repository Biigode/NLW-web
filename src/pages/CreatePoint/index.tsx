import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import "./styles.css";
import logo from "../../assets/logo.svg";
import Api from "../../services/api";
import Axios from "axios";
interface Item {
  id: number;
  title: string;
  image_url: string;
}
interface UFIBGEsigla {
  sigla: string;
}
const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  useEffect(() => {
    Api.get("/items").then((Response) => {
      setItems(Response.data);
    });
  }, []);
  useEffect(() => {
    Axios.get<UFIBGEsigla[]>(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
    ).then((Response) => {
      const ufInitials = Response.data.map((item) => item.sigla);
      setUfs(ufInitials);
    });
  }, []);
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>
      <form>
        <h1>
          Cadastro do <br />
          ponto de coleta
        </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um Endereço no mapa</span>
          </legend>
          <Map center={[-22.9516416, -47.0305158]} zoom={15}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[-22.9516416, -47.0305158]} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Selecione um estado (uf)</label>
              <select name="uf" id="uf">
                <option value="0">Selecione uma UF</option>
                {ufs.map((item) => (
                  <option value={item} key={item}>
                    {item}{" "}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city">
                <option value="0">Selecione uma cidade</option>
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Item de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li key={item.id}>
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar item de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
