RGeo::Geographic::Factory.class_eval do
  def unproject(geometry_)
    return nil unless geometry_
    unless @projector && @projector.projection_factory.srid == geometry_.factory.srid
      raise Error::InvalidGeometry, 'You can unproject only features that are in the projected coordinate space.'
    end
    @projector.unproject(geometry_)
  end
end
